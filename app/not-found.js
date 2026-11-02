import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page py-20 flex flex-col items-center space-y-4 text-center">
      <div className="font-display font-bold text-3xl">Page not found</div>
      <p className="text-sm text-ink-soft">The event or ticket you are looking for does not exist or has been removed.</p>
      <Link href="/" className="btn-primary">
        Back to events
      </Link>
    </main>
  );
}
