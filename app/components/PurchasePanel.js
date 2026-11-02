"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import usePayment from "../hooks/usePayment";
import Loader from "./Loader";

const PHONE_RE = /^7\d{8}$/;

/** Package picker plus the MoMo payment form and its result. Lives on the event page. */
export default function PurchasePanel({ event }) {
  const packages = event.packages || [];
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState(null);
  const payment = usePayment(event, selected);
  const past = new Date(event.date) < new Date();

  function choose(pkg) {
    setSelected(pkg);
    setQuantity(1);
    setFormError(null);
    payment.reset();
  }

  function submit(e) {
    e.preventDefault();
    setFormError(null);
    const digits = phone.trim();
    if (!PHONE_RE.test(digits)) {
      setFormError("Enter the 9-digit MTN number after +250, starting with 7.");
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setFormError("That email address does not look right.");
      return;
    }
    payment.pay(digits, quantity, { name: name.trim() || undefined, email: email.trim() || undefined });
  }

  const total = selected ? selected.price * quantity : 0;
  const finished = payment.status && payment.status !== "pending";

  return (
    <div className="card p-5 space-y-5">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg">Tickets</h2>
        {past && <div className="notice-warn">This event has ended. Tickets are no longer on sale.</div>}
        <div className="grid gap-2" role="radiogroup" aria-label="Ticket package">
          {packages.map((pkg) => {
            const active = selected?._id === pkg._id || (selected && !pkg._id && selected.title === pkg.title);
            const disabled = past || pkg.soldOut;
            const fewLeft = typeof pkg.remaining === "number" && pkg.remaining > 0 && pkg.remaining <= 10;
            return (
              <button
                key={pkg._id || pkg.title}
                type="button"
                role="radio"
                aria-checked={Boolean(active)}
                disabled={disabled}
                onClick={() => choose(pkg)}
                className={`flex items-center justify-between rounded-[var(--radius-control)] px-4 py-3 text-left ring-1 transition-colors ${
                  active ? "ring-2 ring-ember bg-ember-soft" : "ring-mist hover:ring-ink-soft"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-semibold">{pkg.title}</span>
                <span className="flex items-center gap-2">
                  {pkg.soldOut && <span className="chip-muted">Sold out</span>}
                  {!pkg.soldOut && fewLeft && <span className="chip-warn">{pkg.remaining} left</span>}
                  <span className="font-display font-bold tabular-nums">
                    {pkg.price?.toLocaleString()} {pkg.currency || "RWF"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && !finished && (
        <form onSubmit={submit} className="space-y-4" aria-busy={payment.busy}>
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label htmlFor="tel" className="label">Enter a telephone number for payment</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft">+250</span>
                <input
                  id="tel"
                  type="tel"
                  inputMode="numeric"
                  className="input pl-14"
                  placeholder="78xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={payment.busy}
                />
              </div>
            </div>
            <div>
              <label htmlFor="qty" className="label">Tickets</label>
              <select id="qty" className="input w-20" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} disabled={payment.busy}>
                {Array.from({ length: Math.max(1, Math.min(6, typeof selected.remaining === "number" ? selected.remaining : 6)) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="buyerName" className="label">Name (optional)</label>
              <input id="buyerName" className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={payment.busy} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="buyerEmail" className="label">Email for a copy (optional)</label>
              <input id="buyerEmail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={payment.busy} autoComplete="email" />
            </div>
          </div>
          {formError && <div role="alert" className="notice-bad">{formError}</div>}
          {payment.error && <div role="alert" className="notice-bad">{payment.error}</div>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="font-display font-bold text-lg tabular-nums">{total.toLocaleString()} {selected.currency || "RWF"}</span>
          </div>
          {!payment.busy && (
            <button type="submit" className="btn-primary w-full">
              <Image src="/images/mtn.png" alt="" width={22} height={22} className="rounded-sm" />
              Pay online
            </button>
          )}
          {payment.busy && !payment.timedOut && (
            <div className="space-y-2">
              <Loader />
              <p className="text-sm text-center text-ink-soft">
                Approve the payment on your phone. Keep this page open; we check with MTN every few seconds.
              </p>
            </div>
          )}
          {payment.timedOut && (
            <div className="space-y-2">
              <div className="notice-warn">
                No confirmation from MTN yet. If you approved the payment on your phone, check again. Your ticket will also arrive by SMS.
              </div>
              <button type="button" onClick={payment.checkAgain} className="btn-ghost w-full">Check again</button>
            </div>
          )}
        </form>
      )}

      {payment.status === "SUCCESSFUL" && (
        <div className="rounded-[var(--radius-control)] bg-ok-soft text-ok p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <CheckBadgeIcon className="w-6 h-6" /> Payment received
          </div>
          <p className="text-sm">
            Thank you. Your ticket is on its way by SMS; you can also open it here and save the QR code to your phone.
          </p>
          {payment.testMode && <div className="text-xs">Test mode: no money was taken for this ticket.</div>}
          {payment.tickets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {payment.tickets.map((t) => (
                <Link key={t._id} href={`/tickets/${t._id}?showOnly=1`} className="btn-secondary btn-sm">
                  Ticket {t.number}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {finished && payment.status !== "SUCCESSFUL" && (
        <div className="rounded-[var(--radius-control)] bg-bad-soft text-bad p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ExclamationTriangleIcon className="w-6 h-6" /> Payment {String(payment.status).toLowerCase()}
          </div>
          <p className="text-sm">The payment did not go through. No ticket was issued; you can try again.</p>
          {payment.reason && <div className="text-xs">Reason: {String(payment.reason)}</div>}
          <button type="button" onClick={payment.reset} className="btn-ghost btn-sm">Try again</button>
        </div>
      )}
    </div>
  );
}
