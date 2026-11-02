"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getSession } from "../lib/session";
import Loader from "../components/Loader";
import EventCard from "../components/EventCard";

export default function MyEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSession()?.user || null);
    api.get("/events/mine").then(setEvents).catch((err) => setError(`${err.message || err}`));
  }, []);

  return (
    <main className="page py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">{user?.role === "admin" ? "All events" : "My events"}</h1>
          {user?.organisation && <div className="text-sm text-ink-soft">{user.organisation}</div>}
        </div>
        <div className="flex gap-2">
          <Link href="/organiser/staff" className="btn-ghost">Gate staff</Link>
          <Link href="/scan" className="btn-ghost">Scan</Link>
          <Link href="/organiser/events/new" className="btn-primary">New event</Link>
        </div>
      </div>

      {error && <div className="notice-bad">{error}</div>}
      {!events && !error && <Loader />}

      {events && events.length === 0 && (
        <div className="card p-10 text-center space-y-2">
          <div className="font-display font-bold text-xl">No events yet</div>
          <p className="text-sm text-ink-soft">Create your first event to start selling tickets. It appears on the home page as soon as it is saved.</p>
          <Link href="/organiser/events/new" className="btn-primary inline-flex mt-2">Create an event</Link>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event._id} className="space-y-2">
              <div className="relative">
                <EventCard event={event} href={`/organiser/events/${event._id}`} />
                {event.published === false && <span className="absolute left-3 bottom-3 chip-warn">Draft</span>}
              </div>
              <div className="flex gap-2">
                <Link href={`/organiser/events/${event._id}`} className="btn-secondary btn-sm">Dashboard</Link>
                <Link href={`/organiser/events/${event._id}/edit`} className="btn-ghost btn-sm">Edit</Link>
                <Link href={`/events/${event._id}`} className="btn-ghost btn-sm">Public page</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
