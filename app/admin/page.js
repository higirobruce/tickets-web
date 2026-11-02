"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";
import { getSession, homeFor, readError, setSession } from "../lib/session";

/**
 * Login form. With `dashboard` (the default, at /admin) a logged-in admin is sent to the
 * organiser area, which lists every event for admins. Pass `onLogin` and `dashboard={false}`
 * to embed the form inline.
 */
export default function Admin({ onLogin, dashboard = true }) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState(null);
  let [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const current = getSession()?.user || null;
    if (dashboard && current) router.replace(homeFor(current));
  }, []);

  function login(e) {
    e?.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Enter your username and password.");
      return;
    }
    setSigningIn(true);
    fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        if (!res.ok) throw Error(await readError(res, "Check username/password"));
        return res.json();
      })
      .then((session) => {
        setSession(session);
        setPassword("");
        onLogin?.(session.user);
        if (dashboard) router.push(homeFor(session.user));
      })
      .catch((err) => setError(`${err.message || err}`))
      .finally(() => setSigningIn(false));
  }

  const form = (
    <form className="card p-6 sm:p-8 space-y-4 w-full max-w-md" onSubmit={login}>
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl">Log in</h1>
        <p className="text-sm text-ink-soft">For organisers, gate staff and admins.</p>
      </div>
      <div>
        <label htmlFor="email" className="label">Your username</label>
        <input id="email" type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="you@example.com" autoComplete="username" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
      </div>
      {error && <div role="alert" className="notice-bad">{error}</div>}
      <div className="text-right text-sm"><Link href="/forgot" className="text-ember font-semibold">Forgot password?</Link></div>
      <button type="submit" disabled={signingIn} className="btn-primary w-full">
        {signingIn ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-sm text-ink-soft">
        Organising an event?{" "}
        <Link href="/signup" className="text-ember font-semibold">Create an organiser account</Link>
      </p>
    </form>
  );

  if (!dashboard) return form;
  return <main className="page py-10 flex justify-center">{form}</main>;
}
