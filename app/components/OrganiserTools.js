"use client";
import { useState } from "react";
import { API_URL, api } from "@/app/lib/api";
import { authHeaders } from "@/app/lib/session";

/** Organiser actions on the dashboard: complimentary tickets, SMS to holders, attendee export. */
export default function OrganiserTools({ event, onChanged }) {
  const packages = event.packages || [];
  const [comp, setComp] = useState({ packageId: packages[0]?._id || "", quantity: 1, phone: "", note: "" });
  const [compState, setCompState] = useState({ busy: false, error: null, done: null });
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState({ busy: false, error: null, done: null });

  async function issueComplimentary(e) {
    e.preventDefault();
    setCompState({ busy: true, error: null, done: null });
    try {
      const tickets = await api.post(`/events/${event._id}/complimentary`, {
        packageId: comp.packageId,
        quantity: Number(comp.quantity),
        phone: comp.phone ? `250${comp.phone}` : undefined,
        note: comp.note || undefined,
      });
      setCompState({ busy: false, error: null, done: `Issued ${tickets.length} ticket${tickets.length === 1 ? "" : "s"}: ${tickets.map((t) => t.number).join(", ")}` });
      setComp({ ...comp, quantity: 1, phone: "", note: "" });
      onChanged?.();
    } catch (err) {
      setCompState({ busy: false, error: `${err.message || err}`, done: null });
    }
  }

  async function broadcast(e) {
    e.preventDefault();
    setSendState({ busy: true, error: null, done: null });
    try {
      const res = await api.post(`/events/${event._id}/broadcast`, { message });
      setSendState({ busy: false, error: null, done: `Sent to ${res.recipients} phone${res.recipients === 1 ? "" : "s"}` });
      setMessage("");
    } catch (err) {
      setSendState({ busy: false, error: `${err.message || err}`, done: null });
    }
  }

  async function download() {
    const res = await fetch(`${API_URL}/events/${event._id}/attendees.csv`, { headers: authHeaders() });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form onSubmit={issueComplimentary} className="card p-5 space-y-3">
        <h3 className="font-display font-bold">Complimentary tickets</h3>
        <p className="text-xs text-ink-soft">For guests, press and sponsors. They count against capacity but not revenue.</p>
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <select aria-label="Package" className="input" value={comp.packageId} onChange={(e) => setComp({ ...comp, packageId: e.target.value })}>
            {packages.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <input aria-label="Quantity" type="number" min="1" max="50" className="input" value={comp.quantity} onChange={(e) => setComp({ ...comp, quantity: e.target.value })} />
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft">+250</span>
          <input aria-label="Phone to send the tickets to" type="tel" inputMode="numeric" className="input pl-14" placeholder="78xxxxxxx (optional)" value={comp.phone} onChange={(e) => setComp({ ...comp, phone: e.target.value })} />
        </div>
        <input aria-label="Note" className="input" placeholder="Note, e.g. Press" value={comp.note} onChange={(e) => setComp({ ...comp, note: e.target.value })} />
        {compState.error && <div className="notice-bad">{compState.error}</div>}
        {compState.done && <div className="notice-ok">{compState.done}</div>}
        <button type="submit" className="btn-secondary btn-sm" disabled={compState.busy || !comp.packageId}>{compState.busy ? "Issuing..." : "Issue tickets"}</button>
      </form>

      <form onSubmit={broadcast} className="card p-5 space-y-3">
        <h3 className="font-display font-bold">Message ticket holders</h3>
        <p className="text-xs text-ink-soft">One SMS to every phone that bought a ticket, prefixed with the event name.</p>
        <textarea aria-label="Message" className="input min-h-24" maxLength={320} placeholder="Doors open at 17:00. Bring your QR code." value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="text-xs text-ink-soft text-right">{message.length}/320</div>
        {sendState.error && <div className="notice-bad">{sendState.error}</div>}
        {sendState.done && <div className="notice-ok">{sendState.done}</div>}
        <button type="submit" className="btn-secondary btn-sm" disabled={sendState.busy || !message.trim()}>{sendState.busy ? "Sending..." : "Send SMS"}</button>
      </form>

      <div className="card p-5 space-y-3">
        <h3 className="font-display font-bold">Attendee list</h3>
        <p className="text-xs text-ink-soft">Every ticket with phone, buyer, amount and check-in time, as a spreadsheet.</p>
        <button type="button" onClick={download} className="btn-ghost btn-sm">Download CSV</button>
      </div>
    </div>
  );
}
