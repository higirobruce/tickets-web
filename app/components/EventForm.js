"use client";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/app/lib/api";

const STATUSES = ["upcoming", "pending", "ongoing", "postponed", "cancelled", "expired"];
const CURRENCIES = ["RWF", "USD", "EUR"];
const emptyPackage = () => ({ title: "", price: "", currency: "RWF", capacity: "", soldOut: false });

/** Create or edit an event. Pass `event` to edit. */
export default function EventForm({ event }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: event?.title || "",
    artist: event?.artist || "",
    location: event?.location || "",
    imageUrl: event?.imageUrl || "",
    description: event?.description || "",
    date: event?.date ? dayjs(event.date).format("YYYY-MM-DDTHH:mm") : "",
    status: event?.status || "upcoming",
    published: event ? event.published !== false : true,
    packages: event?.packages?.length
      ? event.packages.map((p) => ({ ...emptyPackage(), ...p, price: String(p.price ?? ""), capacity: p.capacity ?? "" }))
      : [{ ...emptyPackage(), title: "Regular" }],
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setPackage = (i, key, value) =>
    setForm({ ...form, packages: form.packages.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)) });

  function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.artist || !form.location || !form.date || !form.imageUrl) {
      setError("Title, artist, date, location and poster image are all required.");
      return;
    }
    if (!/^https:\/\//.test(form.imageUrl)) {
      setError("The poster image must be an https:// link.");
      return;
    }
    const packages = form.packages
      .filter((p) => p.title.trim())
      .map((p) => ({
        _id: p._id,
        title: p.title.trim(),
        price: Number(p.price),
        currency: p.currency,
        capacity: p.capacity === "" || p.capacity === null || p.capacity === undefined ? null : Number(p.capacity),
        soldOut: Boolean(p.soldOut),
      }));
    if (packages.length === 0 || packages.some((p) => !(p.price >= 0))) {
      setError("Add at least one package with a name and a price.");
      return;
    }
    const body = {
      title: form.title,
      artist: form.artist,
      location: form.location,
      imageUrl: form.imageUrl,
      description: form.description,
      date: new Date(form.date).toISOString(),
      status: form.status,
      published: form.published,
      packages,
    };
    setSaving(true);
    const request = event ? api.put(`/events/${event._id}`, body) : api.post("/events", body);
    request
      .then((saved) => router.push(`/organiser/events/${saved._id}`))
      .catch((err) => {
        setError(`${err.message || err}`);
        setSaving(false);
      });
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-8 space-y-6 max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="label">Event title</label>
          <input id="title" className="input" value={form.title} onChange={set("title")} />
        </div>
        <div>
          <label htmlFor="artist" className="label">Artist or headline act</label>
          <input id="artist" className="input" value={form.artist} onChange={set("artist")} />
        </div>
        <div>
          <label htmlFor="location" className="label">Venue</label>
          <input id="location" className="input" value={form.location} onChange={set("location")} />
        </div>
        <div>
          <label htmlFor="date" className="label">Date and time</label>
          <input id="date" type="datetime-local" className="input" value={form.date} onChange={set("date")} />
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input" value={form.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="imageUrl" className="label">Poster image URL</label>
          <input id="imageUrl" type="url" className="input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." />
          {form.imageUrl && /^https:\/\//.test(form.imageUrl) && (
            <img src={form.imageUrl} alt="" className="mt-2 h-32 rounded-[var(--radius-control)] object-cover" />
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description (optional)</label>
          <textarea id="description" className="input min-h-28" value={form.description} onChange={set("description")} placeholder="Line-up, doors open, dress code, anything buyers should know." />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold">Ticket packages</h2>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setForm({ ...form, packages: [...form.packages, emptyPackage()] })}>
            Add package
          </button>
        </div>
        <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-ink-soft px-1">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Currency</div>
          <div className="col-span-2">Capacity</div>
          <div className="col-span-1">Sold out</div>
        </div>
        {form.packages.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input aria-label="Package name" className="input col-span-12 sm:col-span-4" value={p.title} placeholder="VIP" onChange={(e) => setPackage(i, "title", e.target.value)} />
            <input aria-label="Price" type="number" min="0" className="input col-span-4 sm:col-span-2" value={p.price} placeholder="5000" onChange={(e) => setPackage(i, "price", e.target.value)} />
            <select aria-label="Currency" className="input col-span-3 sm:col-span-2" value={p.currency} onChange={(e) => setPackage(i, "currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input aria-label="Capacity" type="number" min={p.sold || 0} className="input col-span-3 sm:col-span-2" value={p.capacity} placeholder="∞" title={p.sold ? `${p.sold} already sold` : "Leave empty for unlimited"} onChange={(e) => setPackage(i, "capacity", e.target.value)} />
            <label className="col-span-2 sm:col-span-1 flex items-center justify-center text-xs">
              <input type="checkbox" checked={Boolean(p.soldOut)} onChange={(e) => setPackage(i, "soldOut", e.target.checked)} />
            </label>
            <button type="button" aria-label="Remove package" className="col-span-1 text-ink-soft hover:text-bad" onClick={() => setForm({ ...form, packages: form.packages.filter((_, idx) => idx !== i) })}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        <span>
          <span className="font-semibold">Published</span>
          <span className="block text-ink-soft">Unticked, the event is a draft: only you can see it, and nobody can buy tickets yet.</span>
        </span>
      </label>

      {error && <div role="alert" className="notice-bad">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : event ? "Save changes" : form.published ? "Publish event" : "Save draft"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push(event ? `/organiser/events/${event._id}` : "/organiser")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
