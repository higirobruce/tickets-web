"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../lib/api";
import { readError } from "../lib/session";

const FIRST_POLL_DELAY_MS = 15000;
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 24; // about two minutes after the first check
const RESUME_WINDOW_MS = 2 * 60 * 60 * 1000; // a reference older than this is not resumed after a reload

const storageKey = (eventId) => `eventixr.payment.${eventId}`;

/** The unresolved payment saved for this event, or null. Storage may be unavailable; that is not an error. */
function readSaved(eventId) {
  try {
    const raw = sessionStorage.getItem(storageKey(eventId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSaved(entry) {
  try {
    sessionStorage.setItem(storageKey(entry.eventId), JSON.stringify(entry));
  } catch {
    // private mode or storage full: the guard then lasts only as long as the page
  }
}

function removeSaved(eventId) {
  try {
    sessionStorage.removeItem(storageKey(eventId));
  } catch {
    // nothing to clean up
  }
}

/**
 * Drives one purchase with the chosen provider: start, poll with a cap, and the result.
 * The backend issues tickets once per reference, so polling is safe to repeat.
 *
 * A payment is "unresolved" while its start request is in flight, or while it has a reference
 * that has not reached a final status. Until then no second payment can start and reset() does
 * nothing: a new reference would be a second prompt or debit on the buyer's phone. startOver()
 * is the one deliberate way out, for a buyer who never approved the first request.
 *
 * An unresolved reference is kept in sessionStorage so a reload or a trip back to the event
 * resumes checking it instead of offering a fresh Pay button. A start request that never got an
 * answer (network failure) is also unresolved: the provider may have charged, so Pay stays hidden
 * until the buyer chooses startOver().
 */
export default function usePayment(event, eventPackage, provider) {
  const [status, setStatus] = useState(null); // null | pending | SUCCESSFUL | FAILED | ...
  const [reason, setReason] = useState(null);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [busy, setBusyState] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [unresolved, setUnresolvedState] = useState(false);
  const [unknownOutcome, setUnknownOutcome] = useState(false); // the start request got no answer
  const [uncertain, setUncertain] = useState(false); // the start failed after the provider may have moved money
  const [pendingRef, setPendingRef] = useState(null); // { refId, packageId, providerId } of the unresolved payment
  const lostStart = useRef(false); // mirrors unknownOutcome for the synchronous guards
  const refId = useRef(null); // reference of the payment still waiting for a final status
  const starting = useRef(false); // a start request is in flight
  const timer = useRef(null);
  const generation = useRef(0); // bumped by reset/startOver so stale polls and replies stop
  const busyNow = useRef(false); // state lags a render; a second click must not start a second debit

  useEffect(
    () => () => {
      generation.current += 1;
      clearTimeout(timer.current);
    },
    [],
  );

  // Resume a payment that was still unresolved when this page was last left or reloaded.
  const eventId = event?._id;
  useEffect(() => {
    if (!eventId || isUnresolved()) return;
    const saved = readSaved(eventId);
    if (!saved) return;
    if (!saved.refId || !(Date.now() - saved.startedAt < RESUME_WINDOW_MS)) {
      removeSaved(eventId);
      return;
    }
    setUncertain(Boolean(saved.uncertain));
    track(saved.refId, saved.packageId, saved.providerId, saved.uncertain, saved.startedAt);
    setStatus("pending");
    poll(1, generation.current);
    // poll and track only touch refs and setters; the event id is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Leaving the page while a payment is unresolved loses sight of it; ask the browser to confirm.
  useEffect(() => {
    if (!unresolved) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unresolved]);

  function setBusy(value) {
    busyNow.current = value;
    setBusyState(value);
  }

  const isUnresolved = () => starting.current || refId.current !== null || lostStart.current;
  const syncUnresolved = () => setUnresolvedState(isUnresolved());

  function clear() {
    generation.current += 1;
    clearTimeout(timer.current);
    setStatus(null);
    setReason(null);
    setError(null);
    setTickets([]);
    setTimedOut(false);
    setBusy(false);
  }

  /** Clear a finished or never-started payment. Returns false (and does nothing) while one is unresolved. */
  function reset() {
    if (isUnresolved()) return false;
    clear();
    return true;
  }

  /** Remember the reference being checked, here and in sessionStorage. */
  function track(id, packageId, providerId, wasUncertain, startedAt = Date.now()) {
    refId.current = id;
    setPendingRef({ refId: id, packageId, providerId });
    if (eventId) writeSaved({ refId: id, eventId, packageId, providerId, uncertain: Boolean(wasUncertain), startedAt });
    syncUnresolved();
  }

  /** Forget the reference: it reached a final status or the buyer gave up on it. */
  function untrack() {
    refId.current = null;
    setPendingRef(null);
    if (eventId) removeSaved(eventId);
  }

  function setLostStart(value) {
    lostStart.current = value;
    setUnknownOutcome(value);
  }

  /** Abandon the unresolved payment, if any, and clear everything. */
  function startOver() {
    untrack();
    starting.current = false;
    setLostStart(false);
    setUncertain(false);
    clear();
    setTestMode(false);
    syncUnresolved();
  }

  function settle(body) {
    untrack(); // anything but PENDING is final for this reference
    setStatus(body.status);
    setReason(body.mock ? null : body.reason);
    setTestMode(Boolean(body.mock));
    setTickets(body.tickets || []);
    setBusy(false);
    syncUnresolved();
  }

  function startPolling(id, delay, wasUncertain = false) {
    setUncertain(wasUncertain);
    track(id, eventPackage._id, provider.id, wasUncertain);
    setStatus("pending");
    const gen = generation.current;
    timer.current = setTimeout(() => poll(1, gen), delay);
  }

  async function pay(phone, quantity = 1, buyer = undefined) {
    if (isUnresolved() || busyNow.current) return;
    clear();
    const gen = generation.current;
    starting.current = true;
    syncUnresolved();
    setBusy(true);
    let res;
    try {
      res = await fetch(`${API_URL}/payments/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.id,
          eventId: event._id,
          packageId: eventPackage._id,
          quantity,
          phone,
          buyer,
        }),
      });
    } catch {
      // No answer at all: the request may have reached the provider. Pay stays hidden until startOver().
      if (gen !== generation.current) return;
      starting.current = false;
      setLostStart(true);
      syncUnresolved();
      setBusy(false);
      return;
    }
    try {
      if (gen !== generation.current) return;
      starting.current = false;
      if (res.status === 200) return settle(await res.json());
      if (res.status === 202) {
        const body = await res.json();
        if (!body.refId) throw Error("The payment started without a reference; check your phone before trying again");
        setTestMode(Boolean(body.mock));
        return startPolling(body.refId, body.mock ? 500 : FIRST_POLL_DELAY_MS);
      }
      if (res.status === 402) {
        const body = await res.json();
        setStatus("FAILED");
        setReason(body.reason);
        setTestMode(Boolean(body.mock));
        setBusy(false);
        syncUnresolved();
        return;
      }
      if (res.status === 500) {
        // The provider may have taken the money; the ticket can still be issued, so keep checking.
        const body = await res.clone().json().catch(() => ({}));
        if (body.refId) return startPolling(body.refId, 0, true);
      }
      throw Error(await readError(res, "Payment request failed"));
    } catch (err) {
      if (gen !== generation.current) return;
      starting.current = false;
      syncUnresolved();
      setError(`${err.message || err}`);
      setBusy(false);
    }
  }

  async function poll(attempt, gen) {
    if (gen !== generation.current) return;
    setBusy(true);
    setTimedOut(false);
    const retry = () => {
      if (gen !== generation.current) return;
      if (attempt >= MAX_POLLS) {
        setTimedOut(true);
        setBusy(false);
        return;
      }
      timer.current = setTimeout(() => poll(attempt + 1, gen), POLL_INTERVAL_MS);
    };
    try {
      const res = await fetch(`${API_URL}/payments/${refId.current}`);
      if (gen !== generation.current) return;
      if (!res.ok) throw Error(await readError(res, "Could not check the payment"));
      const body = await res.json();
      if (gen !== generation.current) return;
      if (body.status === "PENDING") return retry();
      settle(body);
    } catch (err) {
      if (gen !== generation.current) return;
      setError(`${err.message || err}`);
      retry();
    }
  }

  function checkAgain() {
    if (!refId.current) return;
    clearTimeout(timer.current);
    poll(1, generation.current);
  }

  /** Ask the provider who owns a wallet. Never throws. */
  async function lookup(phone) {
    try {
      const res = await fetch(`${API_URL}/payments/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, phone }),
      });
      if (!res.ok) return { ok: false, reason: await readError(res, "Could not check the number") };
      return await res.json();
    } catch {
      return { ok: false, reason: "Could not check the number" };
    }
  }

  return {
    status, reason, error, tickets, busy, timedOut, testMode, unresolved, unknownOutcome, uncertain,
    pendingRef, refId: pendingRef?.refId || null,
    pay, lookup, checkAgain, reset, startOver,
  };
}
