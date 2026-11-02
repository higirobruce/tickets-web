import dayjs from "dayjs";
import Link from "next/link";
import EventCard from "./components/EventCard";
import { fetchPublic } from "./lib/server-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = (await fetchPublic("/events")) || [];
  const now = dayjs();
  const upcoming = events
    .filter((e) => !dayjs(e.date).isBefore(now))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events
    .filter((e) => dayjs(e.date).isBefore(now))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  const next = upcoming[0];

  return (
    <main className="page py-8 space-y-12">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-end">
        <div className="space-y-3">
          <h1 className="font-display font-black text-4xl sm:text-5xl leading-[1.05]">
            Concerts and events in Rwanda.
            <br />
            Pay with MoMo, walk in with a QR code.
          </h1>
          <p className="text-ink-soft max-w-prose">
            Pick an event, choose a package and pay from your phone. Your ticket arrives by SMS and is checked at the gate in a second.
          </p>
        </div>
        {next && (
          <Link href={`/events/${next._id}`} className="card p-4 flex items-center gap-4 hover:ring-ember">
            <div className="bg-night text-white rounded-[var(--radius-control)] px-3 py-2 text-center leading-none">
              <div className="font-display font-black text-2xl">{dayjs(next.date).format("DD")}</div>
              <div className="text-[11px] font-semibold">{dayjs(next.date).format("MMM").toUpperCase()}</div>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-ink-soft">Next up</div>
              <div className="font-display font-bold truncate">{next.title}</div>
              <div className="text-sm text-ink-soft truncate">{next.location}</div>
            </div>
          </Link>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-bold text-2xl">Upcoming events</h2>
          <span className="text-sm text-ink-soft">{upcoming.length} on sale</span>
        </div>
        {upcoming.length === 0 && (
          <div className="card p-10 text-center text-ink-soft">
            Nothing on sale right now. Organising something?{" "}
            <Link href="/signup" className="text-ember font-semibold">Sell your tickets here.</Link>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-display font-bold text-2xl">Recently ended</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
