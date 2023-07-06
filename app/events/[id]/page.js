"use client";
import React, { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import Image from "next/image";
import { url } from "@/app/page";

export const events = [
  {
    _id: "1",
    imageUrl:
      "https://rgtickets.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-25-at-2.05.58-PM-1.jpeg",
    title: "Igicaniro Concert Series with Luc Buntu",
    date: "01st June 2021",
    time: "18h",
    artist: "Luc Buntu",
    location: "The Prayer House",
    packages: [
      {
        title: "Regular",
        price: 5000,
        currency: "RWF",
      },
      {
        title: "VIP",
        price: 10000,
        currency: "RWF",
      },
      {
        title: "VVIP",
        price: 30000,
        currency: "RWF",
      },
    ],
    status: "pending",
  },
  {
    _id: "2",
    imageUrl:
      "https://rgtickets.com/wp-content/uploads/2022/09/WhatsApp-Image-2022-09-13-at-3.24.05-PM.jpeg",
    title: "Igicaniro Concert Series with Ben and Chance",
    date: "01st June 2021",
    time: "18h",
    artist: "Ben and Chance",
    location: "The Prayer House",
    packages: [
      {
        title: "Regular",
        price: 5000,
        currency: "RWF",
      },
      {
        title: "VIP",
        price: 10000,
        currency: "RWF",
      },
      {
        title: "VVIP",
        price: 30000,
        currency: "RWF",
      },
    ],
    status: "pending",
  },
];

export async function getEventDetails(ticketId) {
  return fetch(`${url}/events/${ticketId}`, {
    headers: {
      Content: "application/json",
    },
  })
}
export default function Event({ params }) {
  let [event, setEvent] = useState(null);

  useEffect(() => {
    getEventDetails(params?.id).then(res=>{
      if(res.ok){
        return res.json()
      } else{
        console.log(res.statusText)
      }
    }).then(res=>{
      setEvent(res)
    })
  }, [params]);

  const breakLine = <div className="h-[0.5px] w-full bg-gray-200"></div>;
  return (
    <div className="grid grid-cols-3 py-5 px-36 gap-10">
      <div className="col-span-2 flex flex-col">
        <div className="w-full">
          <Image
            src={event?.imageUrl}
            className="rounded-md"
            height={500}
            width={1000}
          />
        </div>

        <div className="rounded-md bg-white flex flex-col py-5 px-8 mt-5">
          <div className="">Packages</div>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {event?.packages?.map((eventPackage) => {
              return (
                <div className="flex flex-col p-2 ring-1 ring-amber-500 rounded-md justify-center items-center space-y-3" onClick={()=>{
                  alert(eventPackage?.title)
                }}>
                  <div className="text-sm font-semibold capitalize">
                    {eventPackage?.title.toUpperCase()}
                  </div>
                  <div className="text-base font-semibold">
                    {eventPackage?.price?.toLocaleString()}{" "}
                    {eventPackage?.currency}
                  </div>
                  <div className="p-2 rounded-md bg-amber-400 w-full justify-center items-center flex m-5 cursor-pointer shadow-sm">
                    Buy
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded space-y-[2px]">
        <div className="py-5 px-3 bg-white text-sm font-semibold">
          Event details
        </div>
        <div className="py-5 px-3 bg-white flex flex-col space-y-5">
          <div className="flex flex-row items-center space-x-5">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="0.8"
                stroke="currentColor"
                className="w-10 h-10 text-amber-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                />
              </svg>
            </div>
            <div className="flex flex-col text-sm font-thin">
              <div className="font-light">Date and time</div>
              <div>{event?.date}</div>
            </div>
          </div>

          {breakLine}

          <div className="flex flex-row items-center space-x-5">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="0.8"
                stroke="currentColor"
                className="w-10 h-10 text-amber-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col text-sm font-thin">
              <div className="font-light">Status</div>
              <div>{event?.status}</div>
            </div>
          </div>

          {breakLine}
          <div className="flex flex-row items-center space-x-5">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="0.8"
                stroke="currentColor"
                className="w-10 h-10 text-amber-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col text-sm font-thin">
              <div className="font-light">Location</div>
              <div>{event?.location}</div>
            </div>
          </div>

          {breakLine}
          <div className="flex flex-row items-center space-x-5">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="0.8"
                stroke="currentColor"
                className="w-10 h-10 text-amber-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col text-sm font-thin">
              <div className="font-light">Artist</div>
              <div>{event?.artist}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
