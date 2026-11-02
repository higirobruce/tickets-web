"use client";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from "chart.js";
import Loader from "@/app/components/Loader";
import { api } from "@/app/lib/api";
import OrganiserTools from "@/app/components/OrganiserTools";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const palette = {
  backgroundColor: [
    "rgba(232, 84, 30, 0.75)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(255, 206, 86, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ],
  borderColor: [
    "rgba(232, 84, 30, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
  ],
  borderWidth: 1,
};

function Tile({ label, value, hint }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className="font-display font-black text-3xl tabular-nums">{value}</div>
      {hint && <div className="text-xs text-ink-soft">{hint}</div>}
    </div>
  );
}

export default function EventDashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  function load() {
    return api.get(`/events/${id}/dashboard`)
      .then((res) => {
        setData(res);
        setRefreshedAt(new Date());
      })
      .catch((err) => setError(`${err.message || err}`));
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [id]);

  if (error) {
    return (
      <main className="page py-8">
        <div className="notice-bad">{error}</div>
      </main>
    );
  }
  if (!data) return <main className="page py-8"><Loader /></main>;

  const { event, totals, byPackage, recent } = data;
  const currency = event.packages?.[0]?.currency || "RWF";
  const labels = byPackage.map((p) => p.title);
  const capacityHint =
    totals.tickets > 0 ? `${Math.round((totals.consumed / totals.tickets) * 100)}% checked in` : null;

  return (
    <main className="page py-8 space-y-6">
      <div className="flex flex-row flex-wrap gap-3 items-start justify-between">
        <div>
          <Link href="/organiser" className="text-sm text-ember font-semibold">
            My events
          </Link>
          <div className="font-display font-bold text-3xl">{event.title}</div>
          <div className="text-sm text-ink-soft">
            {dayjs(event.date).format("DD-MMM-YYYY hh:mm a")} · {event.location} · {event.artist}
          </div>
        </div>
        <div className="flex flex-row space-x-2 text-sm">
          <Link href={`/organiser/events/${id}/edit`} className="btn-secondary btn-sm">
            Edit
          </Link>
          <Link href={`/events/${id}`} className="btn-ghost btn-sm">
            Public page
          </Link>
          <button type="button" onClick={load} className="btn-ghost btn-sm">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tile label="Tickets issued" value={totals.tickets.toLocaleString()} hint={`${totals.paid.toLocaleString()} paid by MoMo`} />
        <Tile label={`Revenue (${currency})`} value={totals.revenue.toLocaleString()} />
        <Tile label="Checked in" value={totals.consumed.toLocaleString()} hint={capacityHint} />
        <Tile label="Not yet used" value={totals.pending.toLocaleString()} />
      </div>

      {byPackage.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex flex-col items-center space-y-3">
            <div className="text-sm">Revenue by package</div>
            <Pie data={{ labels, datasets: [{ label: "Revenue", data: byPackage.map((p) => p.revenue), ...palette }] }} />
          </div>
          <div className="card p-5 flex flex-col items-center space-y-3">
            <div className="text-sm">Tickets by package</div>
            <Bar data={{ labels, datasets: [{ label: "Tickets", data: byPackage.map((p) => p.count), ...palette }] }} />
          </div>
          <div className="card p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-soft text-left">
                <tr>
                  <th className="py-1">Package</th>
                  <th className="py-1 text-right">Sold</th>
                  <th className="py-1 text-right">In</th>
                  <th className="py-1 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {byPackage.map((p) => (
                  <tr key={p.title} className="border-t border-mist">
                    <td className="py-1">{p.title}</td>
                    <td className="py-1 text-right tabular-nums">{p.count}</td>
                    <td className="py-1 text-right tabular-nums">{p.consumed}</td>
                    <td className="py-1 text-right tabular-nums">{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrganiserTools event={event} onChanged={load} />

      <div className="card p-5 overflow-x-auto">
        <div className="flex flex-row justify-between items-center mb-3">
          <div className="font-display font-bold">Recent tickets</div>
          {refreshedAt && (
            <div className="text-xs text-ink-soft">Updated {dayjs(refreshedAt).format("HH:mm:ss")}</div>
          )}
        </div>
        {recent.length === 0 && (
          <div className="text-sm text-ink-soft">
            No tickets yet. Share the public page so buyers can pay with MTN MoMo.
          </div>
        )}
        {recent.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-soft text-left">
              <tr>
                <th className="py-1">Ticket</th>
                <th className="py-1">Package</th>
                <th className="py-1">Buyer</th>
                <th className="py-1 text-right">Amount</th>
                <th className="py-1">Status</th>
                <th className="py-1">When</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t._id} className="border-t border-mist">
                  <td className="py-1 tabular-nums">
                    <Link href={`/tickets/${t._id}`} className="underline">{t.number}</Link>
                  </td>
                  <td className="py-1">{t.ticketPackage?.title}</td>
                  <td className="py-1 tabular-nums">{t.momoPayload?.payer?.partyId ? `+${t.momoPayload.payer.partyId}` : "—"}</td>
                  <td className="py-1 text-right tabular-nums">{t.momoPayload?.amount ? Number(t.momoPayload.amount).toLocaleString() : "—"}</td>
                  <td className="py-1">
                    <span className={t.status === "consumed" ? "chip-ok" : "chip-warn"}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-1 text-ink-soft">{dayjs(t.createdAt).format("DD MMM HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
