"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import Loader from "@/app/components/Loader";

/** Gate staff accounts owned by the organiser. They can only scan this organiser's events. */
export default function StaffPage() {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function load() {
    api.get("/users/staff").then(setStaff).catch((err) => setError(`${err.message || err}`));
  }
  useEffect(load, []);

  function add(e) {
    e.preventDefault();
    setError(null);
    if (!form.firstName || !form.email || form.password.length < 6) {
      setError("First name, email and a password of at least 6 characters are required.");
      return;
    }
    setSaving(true);
    api
      .post("/users/staff", form)
      .then(() => {
        setForm({ firstName: "", lastName: "", email: "", password: "" });
        load();
      })
      .catch((err) => setError(`${err.message || err}`))
      .finally(() => setSaving(false));
  }

  function remove(id) {
    api.delete(`/users/staff/${id}`).then(load).catch((err) => setError(`${err.message || err}`));
  }

  return (
    <main className="page py-8 space-y-6 max-w-3xl">
      <div className="space-y-1">
        <Link href="/organiser" className="text-sm text-ember font-semibold">My events</Link>
        <h1 className="font-display font-bold text-3xl">Gate staff</h1>
        <p className="text-sm text-ink-soft">
          Staff log in at <Link href="/scan" className="text-ember font-semibold">/scan</Link> on their phone and can only admit tickets for your events.
        </p>
      </div>

      <form onSubmit={add} className="card p-5 grid gap-3 sm:grid-cols-2">
        <div><label htmlFor="firstName" className="label">First name</label><input id="firstName" className="input" value={form.firstName} onChange={set("firstName")} /></div>
        <div><label htmlFor="lastName" className="label">Last name</label><input id="lastName" className="input" value={form.lastName} onChange={set("lastName")} /></div>
        <div><label htmlFor="email" className="label">Email (their username)</label><input id="email" type="email" className="input" value={form.email} onChange={set("email")} /></div>
        <div><label htmlFor="password" className="label">Password</label><input id="password" type="text" className="input" value={form.password} onChange={set("password")} autoComplete="off" /></div>
        {error && <div role="alert" className="notice-bad sm:col-span-2">{error}</div>}
        <div className="sm:col-span-2"><button type="submit" className="btn-primary" disabled={saving}>{saving ? "Adding..." : "Add staff account"}</button></div>
      </form>

      {!staff && !error && <Loader />}
      {staff && staff.length === 0 && <div className="card p-6 text-sm text-ink-soft">No staff yet. Add the people who will work the gate.</div>}
      {staff && staff.length > 0 && (
        <div className="card divide-y divide-mist">
          {staff.map((u) => (
            <div key={u._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <div className="font-semibold">{u.firstName} {u.lastName}</div>
                <div className="text-ink-soft">{u.email}</div>
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => remove(u._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
