"use client";
import useProviders from "@/app/hooks/useProviders";

/** The enabled payment methods' labels, e.g. "MTN Mobile Money · Card". */
export default function PaymentMethods() {
  const { providers, loading, error } = useProviders();
  if (loading || error || providers.length === 0) return "Online payment";
  return providers.map((p) => p.label).join(" · ");
}
