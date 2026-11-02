"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import usePayment from "../hooks/usePayment";
import useProviders from "../hooks/useProviders";
import Loader from "./Loader";

const LOGOS = { momo: "/images/mtn.png", lumicash: "/images/lumicash.png" };
const PLACEHOLDERS = { 250: "78xxxxxxx", 257: "6xxxxxxx" };
const LOOKUP_DELAY_MS = 600;
const NO_LOOKUP = { checking: false, ok: false, name: null, reason: null };

/** Package picker plus the payment method, payment form and result. Lives on the event page. */
export default function PurchasePanel({ event }) {
  const packages = event.packages || [];
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [lookup, setLookup] = useState(NO_LOOKUP);
  const { providers, loading: providersLoading, error: providersError } = useProviders();
  const currency = selected?.currency || "RWF";
  const options = providers.filter((p) => !p.currencies.length || p.currencies.includes(currency));
  const provider = options.find((p) => p.id === providerId) || options[0] || null;
  const payment = usePayment(event, selected, provider);
  const past = new Date(event.date) < new Date();
  const digits = phone.replace(/\s+/g, "");
  const phoneRule = provider?.phone;
  const phoneValid = !phoneRule || new RegExp(phoneRule.pattern).test(digits);
  const needsLookup = provider?.id === "lumicash";

  // Lumicash: confirm the wallet holder once the number looks complete.
  useEffect(() => {
    setLookup(NO_LOOKUP);
    if (!needsLookup || !digits || !phoneValid) return;
    let live = true;
    const t = setTimeout(async () => {
      setLookup({ ...NO_LOOKUP, checking: true });
      const result = await payment.lookup(digits);
      if (live) setLookup({ checking: false, ok: Boolean(result.ok), name: result.name || null, reason: result.reason || null });
    }, LOOKUP_DELAY_MS);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // payment.lookup is a fresh function each render; the inputs below are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsLookup, digits, phoneValid, provider?.id]);

  function choose(pkg) {
    setSelected(pkg);
    setQuantity(1);
    setFormError(null);
    payment.reset();
  }

  function chooseProvider(p) {
    setProviderId(p.id);
    setPhone("");
    setFormError(null);
    payment.reset();
  }

  function submit(e) {
    e.preventDefault();
    setFormError(null);
    if (!phoneValid) {
      setFormError(phoneRule.hint);
      return;
    }
    if (needsLookup && !lookup.ok) return;
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setFormError("That email address does not look right.");
      return;
    }
    payment.pay(digits, quantity, { name: name.trim() || undefined, email: email.trim() || undefined });
  }

  const total = selected ? selected.price * quantity : 0;
  const finished = payment.status && payment.status !== "pending";
  const logo = provider && LOGOS[provider.id];

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

      {selected && !finished && providersLoading && <Loader />}

      {selected && !finished && !providersLoading && !provider && (
        providersError
          ? <div className="notice-bad">{providersError}</div>
          : <div className="notice-warn">Online payment is not available for tickets priced in {currency}.</div>
      )}

      {selected && !finished && provider && (
        <form onSubmit={submit} className="space-y-4" aria-busy={payment.busy}>
          {options.length > 1 && (
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {options.map((p) => {
                const active = p.id === provider.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={payment.busy}
                    onClick={() => chooseProvider(p)}
                    className={`flex items-center gap-3 rounded-[var(--radius-control)] px-4 py-3 text-left ring-1 transition-colors ${
                      active ? "ring-2 ring-ember bg-ember-soft" : "ring-mist hover:ring-ink-soft"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {LOGOS[p.id] && <Image src={LOGOS[p.id]} alt="" width={22} height={22} className="rounded-sm" />}
                    <span className="font-semibold">{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label htmlFor="tel" className="label">Enter a telephone number for payment</label>
              <div className="relative">
                {phoneRule && (
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft">+{phoneRule.countryCode}</span>
                )}
                <input
                  id="tel"
                  type="tel"
                  inputMode="numeric"
                  className={`input ${phoneRule ? "pl-14" : ""}`}
                  placeholder={PLACEHOLDERS[phoneRule?.countryCode] || ""}
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
          {needsLookup && lookup.checking && <p className="text-sm text-ink-soft">Checking the wallet holder…</p>}
          {needsLookup && lookup.ok && lookup.name && <p className="text-sm">Wallet holder: <span className="font-semibold">{lookup.name}</span></p>}
          {needsLookup && !lookup.checking && !lookup.ok && lookup.reason && <div className="notice-bad">{lookup.reason}</div>}
          {formError && <div role="alert" className="notice-bad">{formError}</div>}
          {payment.error && <div role="alert" className="notice-bad">{payment.error}</div>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="font-display font-bold text-lg tabular-nums">{total.toLocaleString()} {currency}</span>
          </div>
          {!payment.busy && (
            <button type="submit" className="btn-primary w-full" disabled={needsLookup && !lookup.ok}>
              {logo && <Image src={logo} alt="" width={22} height={22} className="rounded-sm" />}
              Pay {total.toLocaleString()} {currency}
            </button>
          )}
          {payment.busy && !payment.timedOut && (
            <div className="space-y-2">
              <Loader />
              <p className="text-sm text-center text-ink-soft">
                Approve the payment on your phone. Keep this page open; we check with {provider.label} every few seconds.
              </p>
            </div>
          )}
          {payment.timedOut && (
            <div className="space-y-2">
              <div className="notice-warn">
                No confirmation from {provider.label} yet. If you approved the payment on your phone, check again. Your ticket will also arrive by SMS.
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
