"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../lib/api";
import { homeFor, readError, setSession } from "../lib/session";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState({ busy: false, error: null });

  function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null });
    fetch(`${API_URL}/users/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token ? { token, password } : { email, code, password }),
    })
      .then(async (res) => {
        if (!res.ok) throw Error(await readError(res));
        return res.json();
      })
      .then((session) => {
        setSession(session);
        router.push(homeFor(session.user));
      })
      .catch((err) => setState({ busy: false, error: `${err.message || err}` }));
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8 space-y-4 w-full max-w-md">
      <h1 className="font-display font-bold text-2xl">Choose a new password</h1>
      {!token && (
        <>
          <div>
            <label htmlFor="email" className="label">Email (your username)</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="code" className="label">6-digit code from the SMS</label>
            <input id="code" inputMode="numeric" className="input tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
        </>
      )}
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={6} />
      </div>
      {state.error && <div role="alert" className="notice-bad">{state.error}</div>}
      <button type="submit" className="btn-primary w-full" disabled={state.busy}>{state.busy ? "Saving..." : "Save and log in"}</button>
    </form>
  );
}

export default function Reset() {
  return (
    <main className="page py-10 flex justify-center">
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
