"use client";
import { buidLoader } from "@/app/events/[id]/page";
import { url } from "@/app/page";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  DocumentTextIcon,
  TagIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import dayjs from "dayjs";
import Admin from "@/app/admin/page";

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

export async function sellTicket(number, momoRef, doneBy) {
  return fetch(`${url}/tickets/sell/${number}?doneBy=${doneBy}`, {
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

export async function consumeTicket(number, doneBy) {
  return fetch(`${url}/tickets/consume/${number}?doneBy=${doneBy}`, {
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
  let [user, setUser] = useState(null);
  let [ticket, setTicket] = useState(null);
  let [momoRef, setMomoRef] = useState(null);
  let [loading, setLoading] = useState(false);
  let [selling, setSelling] = useState(false);
  let [confirming, setConfirming] = useState(false);
  let [consuming, setValidating] = useState(false);
  let params = useParams();
  let router = useRouter();
  const searchParams = useSearchParams();
  const showOnly = searchParams.get("showOnly");
  useEffect(() => {
    console.log("feteceehe");
    setUser(JSON.parse(localStorage.getItem("user")));
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
    sellTicket(ticket?.number, momoRef)
      .then((res) => {
        if (res.status === "sold") {
          alert("Successfully Sold the ticket");
          setTicket(res);
          setConfirming(false);
          router.push("/");
        } else alert("Error");
      })
      .catch((err) => {
        alert(err);
      });
  }

  function handleConsumeTicket() {
    consumeTicket(ticket?.number, user?._id).then((res) => {
      if (res.status === "consumed") {
        alert("Successfully consumed the ticket");
        setTicket(res);
        setConfirming(false);
      } else alert("Error");
    });
  }

  return (
    <div>
      {loading && buidLoader}
      {!loading && (user || (!user && showOnly)) && (
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

              <div className="flex flex-row space-x-2 items-center">
                {/* <TagIcon className="h-5 w-5 text-orange-500" /> */}

                <div>{ticket?.status}</div>
              </div>
            </div>
          </div>
          {/* {ticket?.status == "pending" && (
            <div className="flex flex-col space-y-2 md:w-1/3 w-full">
              <div className="text-sm text-gray-500">Momo Reference</div>
              <input
                onChange={(e) => setMomoRef(e.target.value)}
                type="momoRef"
                id="momoRef"
                className="bg-gray-50 border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
                placeholder="MoMo Reference"
              />
            </div>
          )} */}

          {/* {ticket?.status === "pending" && !confirming && (
            <div className="md:w-1/3 w-full flex flex-row justify-between text-sm ">
              {!selling && (
                <button
                  onClick={() => {
                    setConfirming(true);
                  }}
                  // disabled={momoRef ? false : true}
                  className="px-2 py-1 bg-orange-600 text-white rounded "
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
          )} */}

          {/* DISCARDED */}
          {ticket?.status === "pending" && !confirming && !showOnly && (
            <div className="md:w-1/3 w-full flex flex-row justify-between text-sm ">
              {!consuming && (
                <button
                  onClick={() => setConfirming(true)}
                  className="px-2 py-1 bg-green-600 text-white rounded min-w-[80px]"
                >
                  Consume
                </button>
              )}

              {consuming && buidLoader}

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
              {!consuming && (
                <button
                  onClick={handleConsumeTicket}
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

              {consuming && buidLoader}
            </div>
          )}

          {ticket?.status === "consumed" && !confirming && (
            <div className="md:w-1/3 w-full flex flex-col items-center text-sm bg-green-500 rounded p-3 text-white ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-10 h-10 mb-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <div className="mb-2">
                Ticket already consumed at{" "}
                {dayjs(ticket?.updatedAt).format("YYYY-MMM-DD HH:mm:ss a")}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !showOnly && !user && <Admin />}
    </div>
  );
}
