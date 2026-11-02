"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EventForm from "@/app/components/EventForm";
import Loader from "@/app/components/Loader";
import { api } from "@/app/lib/api";

export default function EditEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // The dashboard route also proves the caller manages the event.
    api.get(`/events/${id}/dashboard`).then((res) => setEvent(res.event)).catch((err) => setError(`${err.message || err}`));
  }, [id]);

  return (
    <main className="page py-8 space-y-6">
      <h1 className="font-display font-bold text-3xl">Edit event</h1>
      {error && <div className="notice-bad">{error}</div>}
      {!event && !error && <Loader />}
      {event && <EventForm event={event} />}
    </main>
  );
}
