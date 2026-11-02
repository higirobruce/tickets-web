"use client";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Admin from "../admin/page";
import QrScanner from "../components/QrScanner";
import { api } from "../lib/api";
import { getSession, onSessionChange } from "../lib/session";

/**
 * Gate scanner for staff, organisers and admins. Point the camera at a ticket QR code
 * (or type the number) and the ticket is admitted in one call. Big green or red result.
 */
export default function ScanPage() {
  const [user, setUser] = useState(undefined);
  const [result, setResult] = useState(null); // { ok, title, detail, ticket, event }
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const clearTimer = useRef(null);

  useEffect(() => {
    const read = () => setUser(getSession()?.user || null);
    read();
    return onSessionChange(read);
  }, []);

  async function admit(code) {
    if (busy) return;
    setBusy(true);
    clearTimeout(clearTimer.current);
    try {
      const res = await api.post(`/tickets/scan/${encodeURIComponent(code)}`);
      show({ ok: true, title: `Admit ticket ${res.ticket.number}`, detail: `${res.ticket.ticketPackage?.title || ""} · ${res.event?.title || ""}`, ticket: res.ticket, event: res.event });
    } catch (err) {
      const message = `${err.message || err}`;
      show({ ok: false, title: /already/i.test(message) ? "Already used" : /not for one of your/i.test(message) ? "Wrong event" : /not found/i.test(message) ? "Unknown ticket" : "Not admitted", detail: message });
    } finally {
      setBusy(false);
    }
  }

  function show(r) {
    setResult(r);
    setLog((l) => [{ ...r, at: new Date() }, ...l].slice(0, 20));
    if (navigator.vibrate) navigator.vibrate(r.ok ? 80 : [60, 60, 60]);
    clearTimer.current = setTimeout(() => setResult(null), r.ok ? 3000 : 5000);
  }

  function submitManual(e) {
    e.preventDefault();
    if (!manual.trim()) return;
    admit(manual.trim());
    setManual("");
  }

  if (user === undefined) return null;
  if (!user) {
    return (
      <main className="page py-10 flex flex-col items-center gap-4">
        <p className="text-sm text-ink-soft">Gate staff: log in to start scanning.</p>
        <Admin dashboard={false} onLogin={(u) => setUser(u)} />
      </main>
    );
  }

  return (
    <main className="page py-6 max-w-xl mx-auto space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display font-bold text-2xl">Scan tickets</h1>
        <span className="text-xs text-ink-soft">{user.email}</span>
      </div>

      <div className="relative">
        <QrScanner onCode={admit} paused={Boolean(result)} />
        {result && (
          <div
            role="status"
            className={`absolute inset-0 rounded-[var(--radius-card)] flex flex-col items-center justify-center text-center text-white p-6 ${result.ok ? "bg-ok/95" : "bg-bad/95"}`}
            onClick={() => setResult(null)}
          >
            {result.ok ? <CheckCircleIcon className="w-20 h-20" /> : <XCircleIcon className="w-20 h-20" />}
            <div className="font-display font-black text-3xl mt-2">{result.title}</div>
            <div className="text-sm text-white/90 mt-1">{result.detail}</div>
            <div className="text-xs text-white/70 mt-4">Tap to scan the next one</div>
          </div>
        )}
      </div>

      <form onSubmit={submitManual} className="flex gap-2">
        <input
          aria-label="Ticket number"
          inputMode="numeric"
          className="input"
          placeholder="Or type the ticket number"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <button type="submit" className="btn-secondary" disabled={busy}>Admit</button>
      </form>

      {log.length > 0 && (
        <div className="card divide-y divide-mist">
          {log.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className={entry.ok ? "text-ok font-semibold" : "text-bad font-semibold"}>{entry.title}</span>
              <span className="text-ink-soft truncate">{entry.detail}</span>
              <span className="text-xs text-ink-soft tabular-nums shrink-0">{dayjs(entry.at).format("HH:mm:ss")}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
