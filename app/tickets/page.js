"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { buidLoader } from "../events/[id]/page";
import { url } from "../page";

export async function getAllTickets() {
  return await fetch(`${url}/tickets`, {
    headers: {
      Content: "application/json",
    },
  });
}

export default function page() {
  let [tickets, setTickets] = useState([]);
  let [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    getAllTickets()
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("Error");
      })
      .then((res) => {
        setTickets(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingTickets(false);
      });
  }, []);
  return (
    <>
      {/* {!loadingTickets && (
        <div className="grid grid-cols-1 md:grid-cols-3 py-5 px-10 md:px-36 md:py-10 gap-10">
          {tickets?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tickets?.map((ticket) => {
                return (
                  <div className="flex flex-row space-x-5">
                    <div>
                      <Image src={ticket?.qrCode} height={200} width={200} />
                    </div>
                    <div className="flex flex-col text-sm pt-5">
                      <div>{ticket?.number}</div>
                      <div>{ticket?.ticketPackage?.title}</div>
                      <div>
                        {ticket?.ticketPackage?.price.toLocaleString()}{" "}
                        {ticket?.ticketPackage?.currency}
                      </div>
                     
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {loadingTickets && buidLoader} */}

      <div className="grid grid-cols-1 md:grid-cols-3 py-5 px-10 md:px-36 md:py-10 gap-10"></div>
    </>
  );
}
