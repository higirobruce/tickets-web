"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_URL } from "../lib/api";
import { readError, setSession } from "../lib/session";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ organisation: "", firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.organisation || !form.firstName || !form.email || !form.password) {
      setError("Organisation, first name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Use a password of at least 6 characters.");
      return;
    }
    if (form.phone && !/^7\d{8}$/.test(form.phone)) {
      setError("Enter the 9-digit phone number after +250, starting with 7.");
      return;
    }
    setSubmitting(true);
    fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organisation: form.organisation,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone ? { countryCode: "250", phone: form.phone } : undefined,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw Error(await readError(res, "Could not create the account"));
        return res.json();
      })
      .then((session) => {
        setSession(session);
        router.push("/organiser");
      })
      .catch((err) => setError(`${err.message || err}`))
      .finally(() => setSubmitting(false));
  }

  return (
    <main className="page py-10 grid gap-10 lg:grid-cols-[1fr_440px] items-start">
      <section className="space-y-4 max-w-prose">
        <h1 className="font-display font-black text-4xl leading-tight">Sell tickets for your event</h1>
        <p className="text-ink-soft">
          Publish an event in minutes, take MTN MoMo payments, and follow sales live. Every ticket carries a QR code your team scans at the gate.
        </p>
        <ul className="space-y-2 text-sm text-ink-soft list-disc pl-5">
          <li>As many events and ticket packages as you need.</li>
          <li>A dashboard per event: sales, revenue, who has checked in.</li>
          <li>Buyers get their ticket by SMS the moment they pay.</li>
        </ul>
      </section>
      <form className="card p-6 sm:p-8 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="organisation" className="label">Organisation or promoter name</label>
          <input id="organisation" className="input" value={form.organisation} onChange={set("organisation")} placeholder="Kigali Live Events" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="label">First name</label>
            <input id="firstName" className="input" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last name</label>
            <input id="lastName" className="input" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="label">Email (your username)</label>
          <input id="email" type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone (optional)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft">+250</span>
            <input id="phone" type="tel" inputMode="numeric" className="input pl-14" value={form.phone} onChange={set("phone")} placeholder="78xxxxxxx" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" className="input" value={form.password} onChange={set("password")} autoComplete="new-password" />
        </div>
        {error && <div role="alert" className="notice-bad">{error}</div>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating your account..." : "Create account"}
        </button>
        <p className="text-sm text-ink-soft">
          Already have an account? <Link href="/admin" className="text-ember font-semibold">Log in</Link>
        </p>
      </form>
    </main>
  );
}
