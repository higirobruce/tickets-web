"use client";
import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <main className="page py-20 flex flex-col items-center space-y-4 text-center">
      <div className="font-display font-bold text-3xl">Something went wrong</div>
      <p className="text-sm text-ink-soft">{error?.message || "Please try again."}</p>
      <div className="flex flex-row space-x-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Back to events
        </Link>
      </div>
    </main>
  );
}
