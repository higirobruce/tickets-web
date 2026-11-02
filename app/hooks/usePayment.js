"use client";
import { useRef, useState } from "react";
import { API_URL } from "../lib/api";
import { readError } from "../lib/session";

const FIRST_POLL_DELAY_MS = 15000;
const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 24; // about two minutes after the first check

/**
 * Drives one purchase with the chosen provider: start, poll with a cap, and the result.
 * The backend issues tickets once per reference, so polling is safe to repeat.
 */
export default function usePayment(event, eventPackage, provider) {
  const [status, setStatus] = useState(null); // null | pending | SUCCESSFUL | FAILED | ...
  const [reason, setReason] = useState(null);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [busy, setBusyState] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const refId = useRef(null);
  const timer = useRef(null);
  const busyNow = useRef(false); // state lags a render; a second click must not start a second debit

  function setBusy(value) {
    busyNow.current = value;
    setBusyState(value);
  }

  function reset() {
    clearTimeout(timer.current);
    setStatus(null);
    setReason(null);
    setError(null);
    setTickets([]);
    setTimedOut(false);
    setBusy(false);
  }

  function settle(body) {
    setStatus(body.status);
    setReason(body.mock ? null : body.reason);
    setTestMode(Boolean(body.mock));
    setTickets(body.tickets || []);
    setBusy(false);
  }

  function startPolling(id, delay) {
    refId.current = id;
    setStatus("pending");
    timer.current = setTimeout(() => poll(1), delay);
  }

  async function pay(phone, quantity = 1, buyer = undefined) {
    if (busyNow.current) return;
    reset();
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
      if (res.status === 200) return settle(await res.json());
      if (res.status === 202) {
        const body = await res.json();
        setTestMode(Boolean(body.mock));
        return startPolling(body.refId, body.mock ? 500 : FIRST_POLL_DELAY_MS);
      }
      if (res.status === 402) {
        const body = await res.json();
        setStatus("FAILED");
        setReason(body.reason);
        setBusy(false);
        return;
      }
      if (res.status === 500) {
        // The provider may have taken the money; the ticket can still be issued, so keep checking.
        const body = await res.clone().json().catch(() => ({}));
        if (body.refId) return startPolling(body.refId, 0);
      }
      throw Error(await readError(res, "Payment request failed"));
    } catch (err) {
      setError(`${err.message || err}`);
      setBusy(false);
    }
  }

  async function poll(attempt) {
    setBusy(true);
    setTimedOut(false);
    const retry = () => {
      if (attempt >= MAX_POLLS) {
        setTimedOut(true);
        setBusy(false);
        return;
      }
      timer.current = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };
    try {
      const res = await fetch(`${API_URL}/payments/${refId.current}`);
      if (!res.ok) throw Error(await readError(res, "Could not check the payment"));
      const body = await res.json();
      if (body.status === "PENDING") return retry();
      settle(body);
    } catch (err) {
      setError(`${err.message || err}`);
      retry();
    }
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

  return { status, reason, error, tickets, busy, timedOut, testMode, pay, lookup, checkAgain: () => poll(1), reset };
}
