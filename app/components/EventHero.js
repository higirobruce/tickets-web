import Image from "next/image";
import dayjs from "dayjs";
import { CalendarDaysIcon, MapPinIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";

/** Full-width poster with the event's name and the three facts every buyer needs. */
export default function EventHero({ event }) {
  const date = dayjs(event.date);
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-night text-white">
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        <Image src={event.imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="chip bg-surface text-ink">{date.format("ddd D MMM YYYY")}</span>
          {event.status && event.status !== "upcoming" && event.status !== "pending" && (
            <span className="chip-warn">{event.status}</span>
          )}
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl leading-[1.05] max-w-3xl">{event.title}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
          <span className="inline-flex items-center gap-1.5"><CalendarDaysIcon className="w-4 h-4" />{date.format("HH:mm")}</span>
          <span className="inline-flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" />{event.location}</span>
          {event.artist && <span className="inline-flex items-center gap-1.5"><MusicalNoteIcon className="w-4 h-4" />{event.artist}</span>}
        </div>
      </div>
    </section>
  );
}
