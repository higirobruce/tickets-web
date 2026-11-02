"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { api } from "@/app/lib/api";
import { getSession } from "@/app/lib/session";
import Loader from "@/app/components/Loader";

function Tile({ label, value }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="font-display font-black text-3xl tabular-nums">{value}</div>
    </div>
  );
}

const revenueText = (revenue) =>
  revenue?.length ? revenue.map((r) => `${(r.amount ?? 0).toLocaleString()} ${r.currency}`).join(" · ") : "—";

const ROLES = ["admin", "organiser", "staff"];

/** Platform-wide view for admins: every organiser, their sales, and recent events. */
export default function Platform() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  function load() {
    api.get("/admin/overview").then(setData).catch((err) => setError(`${err.message || err}`));
  }
  useEffect(() => {
    setUser(getSession()?.user || null);
    load();
  }, []);

  async function setRole(id, role) {
    try {
      await api.put(`/admin/users/${id}`, { role });
      load();
    } catch (err) {
      setError(`${err.message || err}`);
    }
  }

  if (user && user.role !== "admin") {
    return <main className="page py-10"><div className="notice-warn max-w-md">This page is for platform admins.</div></main>;
  }
  if (error) return <main className="page py-10"><div className="notice-bad max-w-md">{error}</div></main>;
  if (!data) return <main className="page py-10"><Loader /></main>;

  const { totals, organisers, recentEvents } = data;
  return (
    <main className="page py-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display font-bold text-3xl">Platform overview</h1>
        <Link href="/organiser" className="btn-ghost btn-sm">All events</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Tile label="Organisers" value={totals.organisers} />
        <Tile label="Events" value={totals.events} />
        <Tile label="Tickets" value={totals.tickets.toLocaleString()} />
        <Tile label="Paid" value={totals.paid.toLocaleString()} />
        {(totals.revenue || []).length === 0 ? (
          <Tile label="Revenue" value="0" />
        ) : (
          totals.revenue.map((r) => (
            <Tile key={r.currency} label={`Revenue (${r.currency})`} value={(r.amount ?? 0).toLocaleString()} />
          ))
        )}
        <Tile label="Checked in" value={totals.consumed.toLocaleString()} />
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-bold text-xl">Organisers</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-soft text-left">
              <tr><th className="px-4 py-2">Organisation</th><th className="px-4 py-2">Contact</th><th className="px-4 py-2 text-right">Events</th><th className="px-4 py-2 text-right">Tickets</th><th className="px-4 py-2 text-right">Revenue</th><th className="px-4 py-2">Joined</th><th className="px-4 py-2">Role</th></tr>
            </thead>
            <tbody>
              {organisers.map((o) => (
                <tr key={o._id} className="border-t border-mist">
                  <td className="px-4 py-2 font-semibold">{o.organisation || "—"}</td>
                  <td className="px-4 py-2 text-ink-soft">{o.firstName} {o.lastName}<br />{o.email}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{o.events}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{o.tickets}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{revenueText(o.revenue)}</td>
                  <td className="px-4 py-2 text-ink-soft">{dayjs(o.createdAt).format("D MMM YYYY")}</td>
                  <td className="px-4 py-2">
                    <select aria-label={`Role for ${o.email}`} className="input py-1" value={o.role} onChange={(e) => setRole(o._id, e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {organisers.length === 0 && <tr><td colSpan="7" className="px-4 py-6 text-ink-soft">No organisers have signed up yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-bold text-xl">Recent events</h2>
        <div className="card divide-y divide-mist">
          {recentEvents.map((e) => (
            <div key={e._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <Link href={`/organiser/events/${e._id}`} className="font-semibold hover:text-ember">{e.title}</Link>
                <div className="text-ink-soft">{dayjs(e.date).format("ddd D MMM YYYY, HH:mm")} · {e.location} · {e.owner?.organisation || e.owner?.email || "no owner"}</div>
              </div>
              <div className="flex gap-2">
                {e.published === false && <span className="chip-warn">Draft</span>}
                <Link href={`/events/${e._id}`} className="btn-ghost btn-sm">Public page</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
