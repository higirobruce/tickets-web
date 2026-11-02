import { notFound } from "next/navigation";
import dayjs from "dayjs";
import EventHero from "@/app/components/EventHero";
import PurchasePanel from "@/app/components/PurchasePanel";
import PaymentMethods from "@/app/components/PaymentMethods";
import { fromPrice } from "@/app/components/EventCard";
import { fetchPublic } from "@/app/lib/server-api";

export const dynamic = "force-dynamic";

async function loadEvent(id) {
  if (!/^[0-9a-f]{24}$/.test(id)) return null;
  return fetchPublic(`/events/${id}`);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return { title: "Event not found" };
  const when = dayjs(event.date).format("ddd D MMM YYYY, HH:mm");
  const description = `${when} at ${event.location}. ${fromPrice(event) ? `Tickets from ${fromPrice(event)}.` : ""} Pay by mobile money on EvenTixr.`;
  return {
    title: event.title,
    description,
    openGraph: { title: event.title, description, images: event.imageUrl ? [{ url: event.imageUrl }] : [] },
    twitter: { card: "summary_large_image", title: event.title, description, images: event.imageUrl ? [event.imageUrl] : [] },
  };
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) notFound();

  return (
    <main className="page py-6 space-y-6">
      <EventHero event={event} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">About this event</h2>
          {event.description ? (
            <p className="whitespace-pre-line text-ink-soft">{event.description}</p>
          ) : (
            <p className="text-ink-soft">
              {event.artist ? `${event.artist} live at ${event.location}.` : `At ${event.location}.`} Doors open before the start time shown; bring the QR code from your SMS or this site to the gate.
            </p>
          )}
          <dl className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="card p-4"><dt className="text-ink-soft">Date and time</dt><dd className="font-semibold">{dayjs(event.date).format("ddd D MMM YYYY, HH:mm")}</dd></div>
            <div className="card p-4"><dt className="text-ink-soft">Venue</dt><dd className="font-semibold">{event.location}</dd></div>
            <div className="card p-4"><dt className="text-ink-soft">Payment</dt><dd className="font-semibold"><PaymentMethods /></dd></div>
          </dl>
        </section>
        <div className="lg:sticky lg:top-20">
          <PurchasePanel event={event} />
        </div>
      </div>
    </main>
  );
}
