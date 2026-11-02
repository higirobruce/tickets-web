"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../lib/api";
import { readError } from "../lib/session";

const FIRST_POLL_DELAY_MS = 15000;
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 24; // about two minutes after the first check

/**
 * Drives one purchase with the chosen provider: start, poll with a cap, and the result.
 * The backend issues tickets once per reference, so polling is safe to repeat.
 *
 * A payment is "unresolved" while its start request is in flight, or while it has a reference
 * that has not reached a final status. Until then no second payment can start and reset() does
 * nothing: a new reference would be a second prompt or debit on the buyer's phone. startOver()
 * is the one deliberate way out, for a buyer who never approved the first request.
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

  function setBusy(value) {
    busyNow.current = value;
    setBusyState(value);
  }

  const isUnresolved = () => starting.current || refId.current !== null;
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

  /** Abandon the unresolved payment, if any, and clear everything. */
  function startOver() {
    refId.current = null;
    starting.current = false;
    clear();
    setTestMode(false);
    syncUnresolved();
  }

  function settle(body) {
    refId.current = null; // anything but PENDING is final for this reference
    setStatus(body.status);
    setReason(body.mock ? null : body.reason);
    setTestMode(Boolean(body.mock));
    setTickets(body.tickets || []);
    setBusy(false);
    syncUnresolved();
  }

  function startPolling(id, delay) {
    refId.current = id;
    syncUnresolved();
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
    try {
      const res = await fetch(`${API_URL}/payments/start`, {
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
        if (body.refId) return startPolling(body.refId, 0);
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
    status, reason, error, tickets, busy, timedOut, testMode, unresolved,
    pay, lookup, checkAgain, reset, startOver,
  };
}
