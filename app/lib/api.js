"use client";
import { authHeaders, clearSession, readError } from "./session";

/** Base URL of tickets-backend, baked in at build time. */
export const API_URL = process.env.NEXT_PUBLIC_TICKETS_BCKEND_URL;

async function request(method, path, body, { auth = true } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: auth ? authHeaders() : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && auth) clearSession();
  if (!res.ok) throw Error(await readError(res));
  return res.json();
}

/** Tiny API client. Every call attaches the staff token when one exists and throws with the API's message on failure. */
export const api = {
  get: (path, opts) => request("GET", path, undefined, opts),
  post: (path, body, opts) => request("POST", path, body, opts),
  put: (path, body, opts) => request("PUT", path, body, opts),
  delete: (path, opts) => request("DELETE", path, undefined, opts),
};
