"use client";
import { API_URL, api } from "@/app/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { CheckBadgeIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import Admin from "@/app/admin/page";
import Loader from "@/app/components/Loader";
import { getSession, readError } from "@/app/lib/session";

export async function getTicketDetails(id) {
  return api.get(`/tickets/${id}`, { auth: false });
}

export async function getTicketByNumber(number) {
  return api.get(`/tickets/byNumber/${number}`, { auth: false });
}

export async function sellTicket(number, momoRef) {
  return api.post(`/tickets/sell/${number}?momoRef=${encodeURIComponent(momoRef || "")}`);
}

/** Marks the ticket consumed. The backend records who did it from the token. */
export async function consumeTicket(number) {
  return api.post(`/tickets/consume/${number}`);
}

function Stub({ ticket, event }) {
  const consumed = ticket.status === "consumed";
  return (
    <div className="card overflow-hidden">
      <div className="bg-night text-white p-5 space-y-1">
        <div className="text-xs text-white/70">EvenTixr ticket</div>
        <div className="font-display font-bold text-xl leading-tight">{event?.title || ticket.ticketPackage?.title || "Ticket"}</div>
        {event && (
          <div className="text-sm text-white/80">
            {dayjs(event.date).format("ddd D MMM YYYY, HH:mm")} · {event.location}
          </div>
        )}
      </div>
      <div className="border-t border-dashed border-mist" />
      <div className="p-5 grid grid-cols-[auto_1fr] gap-5 items-center">
        {ticket.qrCode ? (
          <Image width={128} height={128} src={ticket.qrCode} alt="Ticket QR code" className={consumed ? "opacity-40" : ""} />
        ) : (
          <QrCodeIcon className="w-24 h-24 text-mist" />
        )}
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-ink-soft">Ticket number</dt>
            <dd className="font-display font-black text-2xl tabular-nums tracking-tight">{ticket.number}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Package</dt>
            <dd className="font-semibold">{ticket.ticketPackage?.title} · {ticket.ticketPackage?.price?.toLocaleString()} {ticket.ticketPackage?.currency}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Status</dt>
            <dd>
              <span className={consumed ? "chip-muted" : "chip-ok"}>{ticket.status}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/**
 * Ticket stub with the consume flow for logged-in staff, inline login otherwise,
 * and a read-only view when `?showOnly=1` (the SMS / QR link).
 */
export default function TicketView({ id, fetchTicket = getTicketDetails }) {
  let [user, setUser] = useState(null);
  let [ticket, setTicket] = useState(null);
  let [event, setEvent] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(null);
  let [notice, setNotice] = useState(null);
  let [confirming, setConfirming] = useState(false);
  let [consuming, setConsuming] = useState(false);
  let router = useRouter();
  const searchParams = useSearchParams();
  const showOnly = searchParams.get("showOnly");

  useEffect(() => {
    setUser(getSession()?.user || null);
    setLoading(true);
    fetchTicket(id)
      .then(async (t) => {
        setTicket(t);
        if (t?.event) setEvent(await api.get(`/events/${t.event}`, { auth: false }).catch(() => null));
      })
      .catch((err) => setError(`${err.message || err}`))
      .finally(() => setLoading(false));
  }, [id]);

  function handleConsumeTicket() {
    setConsuming(true);
    setError(null);
    consumeTicket(ticket?.number)
      .then((res) => {
        if (res.status === "consumed") {
          setNotice("Successfully consumed the ticket");
          setTicket(res);
          setConfirming(false);
        } else setError("The ticket could not be consumed.");
      })
      .catch((err) => {
        setError(`${err.message || err}`);
        if (!getSession()) setUser(null);
      })
      .finally(() => setConsuming(false));
  }

  if (loading) return <Loader />;
  if (error && !ticket) {
    return (
      <main className="page py-10">
        <div className="notice-bad max-w-md">{error}</div>
      </main>
    );
  }

  return (
    <main className="page py-8">
      <div className="max-w-md mx-auto space-y-4">
        {ticket && (user || showOnly) && (
          <>
            <Stub ticket={ticket} event={event} />
            {error && <div role="alert" className="notice-bad">{error}</div>}
            {notice && <div className="notice-ok">{notice}</div>}

            {showOnly && ticket.status !== "consumed" && (
              <p className="text-sm text-ink-soft text-center">Show this QR code at the gate. A screenshot works too.</p>
            )}

            {user && ticket.status === "pending" && !showOnly && !confirming && (
              <div className="flex gap-3">
                <button type="button" onClick={() => setConfirming(true)} className="btn-primary flex-1" disabled={consuming}>
                  Consume
                </button>
                <button type="button" className="btn-ghost" onClick={() => router.push("/")}>Cancel</button>
              </div>
            )}

            {user && ticket.status === "pending" && confirming && (
              <div className="card p-4 space-y-3">
                <p className="text-sm">Admit this ticket? It cannot be used again afterwards.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleConsumeTicket} className="btn-primary flex-1" disabled={consuming}>
                    {consuming ? "Admitting..." : "Confirm"}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="btn-ghost" disabled={consuming}>Cancel</button>
                </div>
              </div>
            )}

            {ticket.status === "consumed" && (
              <div className="rounded-[var(--radius-control)] bg-ok-soft text-ok p-4 flex items-start gap-3">
                <CheckBadgeIcon className="w-7 h-7 shrink-0" />
                <div className="text-sm">
                  <div className="font-semibold">Ticket already consumed</div>
                  <div>at {dayjs(ticket.updatedAt).format("D MMM YYYY, HH:mm:ss")}</div>
                </div>
              </div>
            )}

            {event && (
              <div className="text-center">
                <Link href={`/events/${event._id}`} className="text-sm text-ember font-semibold">Event page</Link>
              </div>
            )}
          </>
        )}

        {ticket && !showOnly && !user && (
          <>
            <p className="text-sm text-ink-soft text-center">Gate staff: log in to admit this ticket.</p>
            <Admin dashboard={false} onLogin={(u) => setUser(u)} />
          </>
        )}
      </div>
    </main>
  );
}
