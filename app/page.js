"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export let url = process.env.NEXT_PUBLIC_TICKETS_BCKEND_URL
// export const events = [
//   {
//     _id: "1",
//     imageUrl:
//       "https://rgtickets.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-25-at-2.05.58-PM-1.jpeg",
//     title: "Igicaniro Concert Series with Luc Buntu",
//     date: "01st June 2021",
//     time: "18h",
//     artist: "Luc Buntu",
//     location: "The Prayer House",
//     packages: [
//       {
//         title: "Regular",
//         price: 5000,
//         currency: "RWF",
//       },
//       {
//         title: "VIP",
//         price: 10000,
//         currency: "RWF",
//       },
//       {
//         title: "VVIP",
//         price: 30000,
//         currency: "RWF",
//       },
//     ],
//     status: "pending",
//   },
//   {
//     _id: "2",
//     imageUrl:
//       "https://rgtickets.com/wp-content/uploads/2022/09/WhatsApp-Image-2022-09-13-at-3.24.05-PM.jpeg",
//     title: "Igicaniro Concert Series with Ben and Chance",
//     date: "01st June 2021",
//     time: "18h",
//     artist: "Ben and Chance",
//     location: "The Prayer House",
//     packages: [
//       {
//         title: "Regular",
//         price: 5000,
//         currency: "RWF",
//       },
//       {
//         title: "VIP",
//         price: 10000,
//         currency: "RWF",
//       },
//       {
//         title: "VVIP",
//         price: 30000,
//         currency: "RWF",
//       },
//     ],
//     status: "pending",
//   },
// ];

export async function getEvents() {
  const res = await fetch(`${url}/events`, {
    method: "GET",
    headers: {
      Content: "application/json",
    },
  });
  if (res.ok) {
    return res.json();
  } else {
    console.log(res.statusText)
    // throw Error(res.statusText);
  }
}

export default function Home() {
  let routert = useRouter();
  let [events, setEvents] = useState([]);
  useEffect(() => {
    getEvents().then((res) => {
      setEvents(res);
    });
  }, []);
  return (
    <main className="flex h-screen flex-col p-24">
      <div className="text-2xl font-semibold mb-5">Upcoming Events</div>
      {/* Event Cards */}
      <div className="grid grid-cols-3 gap-4">
        {events?.map((event) => {
          return (
            <div
              className="rounded-md shadow-sm cursor-pointer hover:shadow-lg"
              onClick={() => {
                routert.push(`/events/${event._id}`);
              }}
            >
              <div className="flex flex-col">
                {/* Picture */}
                <Image src={event.imageUrl} height={300} width={500} />
              </div>
              <div className="bg-white flex flex-col p-5 rounded-b-md space-y-4">
                {/* Title */}
                <div className="text-md font-semibold">{event.title}</div>

                {/* Ente date and time */}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-row items-center space-x-1">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-4 h-4 text-amber-700"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{event.date}</div>
                  </div>

                  <div className="flex flex-row items-center space-x-1">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-4 h-4 text-amber-700"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{event.time}</div>
                  </div>

                  <div className="flex flex-row items-center space-x-1">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-4 h-4 text-amber-700"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
