"use client";
import { useEffect, useState } from "react";
import Admin from "../admin/page";
import { getSession, onSessionChange } from "../lib/session";

/** Everything under /organiser needs an organiser or admin session. */
export default function OrganiserLayout({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const read = () => setUser(getSession()?.user || null);
    read();
    return onSessionChange(read);
  }, []);

  if (user === undefined) return null;
  if (!user) {
    return (
      <main className="page py-10 flex justify-center">
        <Admin dashboard={false} onLogin={(u) => setUser(u)} />
      </main>
    );
  }
  if (user.role === "staff") {
    return (
      <main className="page py-10">
        <div className="notice-warn max-w-md">Gate staff accounts do not manage events. Ask the platform admin to make you an organiser.</div>
      </main>
    );
  }
  return <>{children}</>;
}
