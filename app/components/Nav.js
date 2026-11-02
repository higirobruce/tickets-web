"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { clearSession, getSession, onSessionChange } from "../lib/session";

/** Site navigation: brand, event link, and session-aware actions, with a disclosure menu on phones. */
export default function Nav() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const read = () => setUser(getSession()?.user || null);
    read();
    return onSessionChange(read);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = user
    ? [
        ...(user.role !== "staff" ? [{ href: "/organiser", label: "My events" }] : []),
        ...(user.role === "admin" ? [
              { href: "/admin/platform", label: "Platform" },
              { href: "/admin/payments", label: "Payments" },
            ] : []),
        { href: "/scan", label: "Scan" },
      ]
    : [
        { href: "/signup", label: "Sell tickets" },
        { href: "/admin", label: "Log in" },
      ];

  function logout() {
    clearSession();
    router.push("/");
  }

  const items = (
    <>
      <Link href="/" className="text-sm font-medium hover:text-gold">Events</Link>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-gold">
          {l.label}
        </Link>
      ))}
      {user && (
        <button type="button" onClick={logout} className="text-sm font-medium text-left hover:text-gold">
          Log out
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 bg-night text-white">
      <div className="page flex items-center justify-between h-14">
        <Link href="/" className="font-display font-black text-xl tracking-tight">
          Even<span className="text-ember">Tixr</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">{items}</nav>
        <button
          type="button"
          className="sm:hidden p-2 -mr-2"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <nav className="sm:hidden border-t border-night-soft">
          <div className="page py-3 flex flex-col gap-3">{items}</div>
        </nav>
      )}
    </header>
  );
}
