/**
 * Server-side access to tickets-backend for server components and metadata.
 * API_INTERNAL_URL lets the web server reach the API on the same machine when the
 * public hostname is not routable from inside (hairpin NAT); the browser keeps using the public URL.
 */
const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_TICKETS_BCKEND_URL;

export async function fetchPublic(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
