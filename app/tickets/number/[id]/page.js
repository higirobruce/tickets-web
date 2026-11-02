"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import TicketView, { getTicketByNumber } from "@/app/components/TicketView";

export default function TicketByNumberPage() {
  const params = useParams();
  return (
    <Suspense>
      <TicketView id={params.id} fetchTicket={getTicketByNumber} />
    </Suspense>
  );
}
