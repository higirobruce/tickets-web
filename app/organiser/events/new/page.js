"use client";
import EventForm from "@/app/components/EventForm";

export default function NewEvent() {
  return (
    <main className="page py-8 space-y-6">
      <h1 className="font-display font-bold text-3xl">New event</h1>
      <EventForm />
    </main>
  );
}
