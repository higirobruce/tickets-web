import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { MapPinIcon } from "@heroicons/react/24/outline";

export function fromPrice(event) {
  const prices = (event.packages || []).map((p) => p.price).filter((p) => typeof p === "number");
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const currency = event.packages.find((p) => p.price === min)?.currency || "RWF";
  return `${min.toLocaleString()} ${currency}`;
}

/** Poster-first event card. The date is set as a stamp so a list reads like a calendar. */
export default function EventCard({ event, href }) {
  const date = dayjs(event.date);
  const past = date.isBefore(dayjs());
  const packages = event.packages || [];
  const soldOut = packages.length > 0 && packages.every((p) => p.soldOut);
  const remaining = packages.reduce((sum, p) => (typeof p.remaining === "number" ? sum + p.remaining : sum), 0);
  const limited = packages.some((p) => typeof p.remaining === "number");
  const price = fromPrice(event);
  const target = href || `/events/${event._id}`;

  return (
    <article className="card overflow-hidden flex flex-col">
      <Link href={target} className="relative block aspect-[16/10] bg-night">
        <Image src={event.imageUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className={`object-cover ${past ? "grayscale opacity-70" : ""}`} />
        <div className="absolute left-3 top-3 bg-surface text-ink rounded-[var(--radius-control)] px-2.5 py-1.5 text-center leading-none">
          <div className="font-display font-black text-2xl">{date.format("DD")}</div>
          <div className="text-[11px] font-semibold tracking-wide">{date.format("MMM").toUpperCase()}</div>
        </div>
        {past && <span className="absolute right-3 top-3 chip-muted">Past event</span>}
        {!past && soldOut && <span className="absolute right-3 top-3 chip-muted">Sold out</span>}
        {!past && !soldOut && limited && remaining <= 20 && <span className="absolute right-3 top-3 chip-warn">{remaining} left</span>}
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1 space-y-1">
          <h3 className="font-display font-bold text-lg leading-snug">
            <Link href={target} className="hover:text-ember">{event.title}</Link>
          </h3>
          <div className="text-sm text-ink-soft">{date.format("ddd D MMM, HH:mm")}</div>
          <div className="text-sm text-ink-soft flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            {price ? (
              <>
                <span className="text-ink-soft">from </span>
                <span className="font-semibold">{price}</span>
              </>
            ) : (
              <span className="text-ink-soft">Free entry</span>
            )}
          </div>
          {past ? (
            <span className="btn-ghost btn-sm cursor-default">Ended</span>
          ) : soldOut ? (
            <Link href={target} className="btn-ghost btn-sm">Sold out</Link>
          ) : (
            <Link href={target} className="btn-primary btn-sm">Buy ticket</Link>
          )}
        </div>
      </div>
    </article>
  );
}
