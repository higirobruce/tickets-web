"use client";

const KEY = "session";

/** The logged-in staff session: { token, user }. Lives in localStorage only. */
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.token ? session : null;
  } catch {
    return null;
  }
}

const CHANGED = "session-changed";

function announce() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGED));
}

/** Subscribe to login/logout in this tab. Returns the unsubscribe function. */
export function onSessionChange(listener) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
}

export function setSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
    localStorage.removeItem("user"); // pre-token sessions stored the raw user
  } catch {}
  announce();
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("user");
  } catch {}
  announce();
}

/** Where a freshly logged-in user belongs. */
export function homeFor(user) {
  return user?.role === "staff" ? "/scan" : "/organiser";
}

export function authHeaders() {
  const session = getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

/** Fetch that attaches the token and drops the session when the API says it is no longer valid. */
export async function authFetch(input, init = {}) {
  const res = await fetch(input, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
  });
  if (res.status === 401) clearSession();
  return res;
}

/** authFetch that resolves to parsed JSON or throws with the API's message. */
export async function apiJson(input, init = {}) {
  const res = await authFetch(input, init);
  if (!res.ok) throw Error(await readError(res));
  return res.json();
}

export async function readError(res, fallback = "Something went wrong") {
  try {
    const body = await res.json();
    return body?.errorMessage || fallback;
  } catch {
    return res.statusText || fallback;
  }
}
