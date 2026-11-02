"use client";
import Link from "next/link";
import { useState } from "react";
import { API_URL } from "../lib/api";
import { readError } from "../lib/session";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [via, setVia] = useState("email");
  const [state, setState] = useState({ busy: false, done: null, error: null });

  function submit(e) {
    e.preventDefault();
    setState({ busy: true, done: null, error: null });
    fetch(`${API_URL}/users/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, via }),
    })
      .then(async (res) => {
        if (!res.ok) throw Error(await readError(res));
        return res.json();
      })
      .then((res) => setState({ busy: false, error: null, done: res.via || "none" }))
      .catch((err) => setState({ busy: false, done: null, error: `${err.message || err}` }));
  }

  return (
    <main className="page py-10 flex justify-center">
      <form onSubmit={submit} className="card p-6 sm:p-8 space-y-4 w-full max-w-md">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl">Reset your password</h1>
          <p className="text-sm text-ink-soft">We send a reset link to your email, or a 6-digit code to the phone on your account.</p>
        </div>
        {state.done ? (
          <div className="space-y-3">
            <div className="notice-ok">
              {state.done === "sms"
                ? "If that account has a phone number, a code is on its way by SMS."
                : "If that account exists, a reset link is on its way. Check your inbox and spam folder."}
            </div>
            {state.done === "sms" && (
              <Link href={`/reset?email=${encodeURIComponent(email)}`} className="btn-primary w-full">Enter the code</Link>
            )}
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="label">Email (your username)</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <fieldset className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="via" checked={via === "email"} onChange={() => setVia("email")} /> Email link</label>
              <label className="flex items-center gap-2"><input type="radio" name="via" checked={via === "sms"} onChange={() => setVia("sms")} /> SMS code</label>
            </fieldset>
            {state.error && <div role="alert" className="notice-bad">{state.error}</div>}
            <button type="submit" className="btn-primary w-full" disabled={state.busy}>{state.busy ? "Sending..." : "Send"}</button>
          </>
        )}
        <p className="text-sm text-ink-soft"><Link href="/admin" className="text-ember font-semibold">Back to log in</Link></p>
      </form>
    </main>
  );
}
