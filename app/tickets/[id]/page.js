"use client";
import { buidLoader } from "@/app/events/[id]/page";
import { url } from "@/app/page";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DocumentTextIcon,
  TagIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export async function getTicketDetails(id, setLoading) {
  setLoading(true);
  return fetch(`${url}/tickets/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw Error(res.statusText);
    }
  });
}


export async function sellTicket(number) {
  return fetch(`${url}/tickets/sell/${number}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw Error(res.statusText);
    }
  });
}

export async function validateTicket(number) {
    return fetch(`${url}/tickets/validate/${number}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    });
  }
export default function page() {
  let [ticket, setTicket] = useState(null);
  let [loading, setLoading] = useState(false);
  let [selling, setSelling] = useState(false);
  let [confirming, setConfirming] = useState(false);
  let [validating, setValidating] = useState(false)
  let params = useParams();
  let router = useRouter();
  useEffect(() => {
    getTicketDetails(params.id, setLoading)
      .then((res) => {
        setTicket(res);
      })
      .catch((err) => {
        alert(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleSellTicket() {
    sellTicket(ticket?.number).then((res) => {
      if (res.status === "sold") {
        alert("Successfully Sold the ticket");
        setTicket(res);
        setConfirming(false)
        router.push('/')
      } else alert("Error");
    });
  }

  function handleValidateTicket() {
    validateTicket(ticket?.number).then((res) => {
      if (res.status === "consumed") {
        alert("Successfully consumed the ticket");
        setTicket(res);
        setConfirming(false)
        router.push('/')
      } else alert("Error");
    });
  }
  return (
    <div>
      {loading && buidLoader}
      {!loading && (
        <div className="flex flex-col items-center justify-center px-5 md:px-36 py-10 md:py-20 space-y-5">
          <div className="flex flex-row justify-between bg-white p-5 rounded-md ring-1 ring-orange-200 md:w-1/3 w-full">
            <Image width={100} height={100} src={ticket?.qrCode} />
            <div className="text-sm flex flex-col space-y-3">
              <div className="flex flex-row space-x-2 items-center">
                <TicketIcon className="h-5 w-5 text-orange-500" />
                <div>{ticket?.number}</div>
              </div>

              <div className="flex flex-row space-x-2 items-center">
                <DocumentTextIcon className="h-5 w-5 text-orange-500" />
                <div>{ticket?.ticketPackage?.title}</div>
              </div>

              <div className="flex flex-row space-x-2 items-center">
                <TagIcon className="h-5 w-5 text-orange-500" />
                <div>
                  {ticket?.ticketPackage?.price?.toLocaleString()}{" "}
                  {ticket?.ticketPackage?.currency}
                </div>
              </div>
            </div>
          </div>

          {ticket?.status === "pending" && !confirming && (
            <div className="md:w-1/3 w-full flex flex-row justify-between text-sm ">
              {!selling && (
                <button
                  onClick={() => setConfirming(true)}
                  className="px-2 py-1 bg-orange-600 text-white rounded min-w-[80px]"
                >
                  Sell
                </button>
              )}

              {selling && buidLoader}
              <button
                className="px-2 py-1 bg-gray-800 text-white rounded"
                onClick={() => router.push("/")}
              >
                Cancel
              </button>
            </div>
          )}

          {ticket?.status === "pending" && confirming && (
            <div className="md:w-1/3 w-full flex flex-col space-y-2 justify-between text-sm ">
              {!selling && (
                <button
                  onClick={handleSellTicket}
                  className="px-2 py-1 bg-orange-600 text-white rounded w-full"
                >
                  Confirm
                </button>
              )}

              <button
                onClick={() => setConfirming(false)}
                className="px-2 py-1 bg-gray-800 text-white rounded w-full"
              >
                Cancel
              </button>

              {selling && buidLoader}
            </div>
          )}

          {ticket?.status === "sold" && !confirming && (
            <div className="md:w-1/3 w-full flex flex-row justify-between text-sm ">
              {!validating && (
                <button
                  onClick={() => setConfirming(true)}
                  className="px-2 py-1 bg-green-600 text-white rounded min-w-[80px]"
                >
                  Validate
                </button>
              )}

              {validating && buidLoader}

              <button
                className="px-2 py-1 bg-gray-800 text-white rounded"
                onClick={() => router.push("/")}
              >
                Cancel
              </button>
            </div>
          )}

          {ticket?.status === "sold" && confirming && (
            <div className="md:w-1/3 w-full flex flex-col space-y-2 justify-between text-sm ">
              {!validating && (
                <button
                    onClick={handleValidateTicket}
                  className="px-2 py-1 bg-green-600 text-white rounded w-full"
                >
                  Confirm
                </button>
              )}

              <button
                onClick={() => setConfirming(false)}
                className="px-2 py-1 bg-gray-800 text-white rounded w-full"
              >
                Cancel
              </button>

              {validating && buidLoader}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
