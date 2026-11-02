"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import TicketView, { getTicketDetails } from "@/app/components/TicketView";


export default function TicketPage() {
  const params = useParams();
  return (
    <Suspense>
      <TicketView id={params.id} fetchTicket={getTicketDetails} />
    </Suspense>
  );
}
