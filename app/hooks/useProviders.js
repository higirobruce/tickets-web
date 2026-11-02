"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";
import { readError } from "../lib/session";

// One request per page load, shared by every component that asks.
let cache = null;

function loadProviders() {
  if (!cache) {
    cache = fetch(`${API_URL}/payments/providers`)
      .then(async (res) => {
        if (!res.ok) throw Error(await readError(res, "Could not load payment methods"));
        return res.json();
      })
      .catch((err) => {
        cache = null; // let a later mount try again
        throw err;
      });
  }
  return cache;
}

/** The payment providers the backend has enabled: { providers, loading, error }. */
export default function useProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    loadProviders()
      .then((list) => live && setProviders(Array.isArray(list) ? list : []))
      .catch((err) => live && setError(`${err.message || err}`))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return { providers, loading, error };
}
