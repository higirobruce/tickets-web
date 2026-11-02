"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { api } from "@/app/lib/api";
import { getSession } from "@/app/lib/session";
import useProviders from "@/app/hooks/useProviders";
import Loader from "@/app/components/Loader";

const STATUS_FILTERS = ["PENDING", "FAILED", "SUCCESSFUL", "EXPIRED", "All"];
const CHIP = {
  SUCCESSFUL: "chip-ok",
  FAILED: "chip-bad",
  EXPIRED: "chip-muted",
  PENDING: "chip-warn",
  ISSUING: "chip-warn",
};

/** Admin view of payment attempts across providers, with a manual "verify now" per row. */
export default function Payments() {
  const { providers } = useProviders();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [provider, setProvider] = useState("All");
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState(null);
  const [checks, setChecks] = useState({}); // refId -> { busy, text, bad }

  function load() {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (provider !== "All") params.set("provider", provider);
    const query = params.toString();
    setError(null);
    return api
      .get(`/admin/payments${query ? `?${query}` : ""}`)
      .then((res) => setPayments(res.payments || []))
      .catch((err) => setError(`${err.message || err}`));
  }

  useEffect(() => {
    setUser(getSession()?.user || null);
  }, []);
  useEffect(() => {
    setPayments(null);
    load();
  }, [status, provider]);

  async function verify(refId) {
    setChecks((c) => ({ ...c, [refId]: { busy: true } }));
    try {
      const res = await api.post(`/admin/payments/${refId}/verify`);
      const text = res.reason ? `${res.status}: ${res.reason}` : res.status;
      setChecks((c) => ({ ...c, [refId]: { text, bad: res.status === "FAILED" } }));
      load();
    } catch (err) {
      setChecks((c) => ({ ...c, [refId]: { text: `${err.message || err}`, bad: true } }));
    }
  }

  if (user && user.role !== "admin") {
    return <main className="page py-10"><div className="notice-warn max-w-md">This page is for platform admins.</div></main>;
  }

  return (
    <main className="page py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display font-bold text-3xl">Payments</h1>
        <Link href="/admin/platform" className="btn-ghost btn-sm">Platform overview</Link>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="provider" className="label">Provider</label>
          <select id="provider" className="input py-1" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="All">All</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>

      {error && <div className="notice-bad max-w-md">{error}</div>}
      {!payments && !error && <Loader />}
      {payments && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-soft text-left">
              <tr>
                <th className="px-4 py-2">Ref</th>
                <th className="px-4 py-2">Provider</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Issue error</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const check = checks[p.refId];
                return (
                  <tr key={p.refId} className="border-t border-mist align-top">
                    <td className="px-4 py-2 font-mono" title={p.refId}>{String(p.refId).slice(0, 8)}</td>
                    <td className="px-4 py-2">{p.provider}</td>
                    <td className="px-4 py-2"><span className={CHIP[p.status] || "chip-muted"}>{p.status}</span></td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {p.amount != null ? `${Number(p.amount).toLocaleString()} ${p.currency || ""}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{p.phone ? `+${p.phone}` : "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{p.quantity ?? "—"}</td>
                    <td className="px-4 py-2 text-ink-soft">{dayjs(p.createdAt).format("D MMM YYYY, HH:mm")}</td>
                    <td className="px-4 py-2 text-bad text-xs">{p.issueError || ""}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button type="button" className="btn-secondary btn-sm" disabled={check?.busy} onClick={() => verify(p.refId)}>
                        {check?.busy ? "Checking..." : "Verify now"}
                      </button>
                      {check?.text && (
                        <div className={`text-xs mt-1 ${check.bad ? "text-bad" : "text-ink-soft"}`}>{check.text}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr><td colSpan="9" className="px-4 py-6 text-ink-soft">No payments match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
