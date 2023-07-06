"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useNextBlurhash from "use-next-blurhash";

export let url = process.env.NEXT_PUBLIC_TICKETS_BCKEND_URL;
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
    console.log(res.statusText);
    // throw Error(res.statusText);
  }
}

export default function Home() {
  let routert = useRouter();
  let [events, setEvents] = useState([]);
  const [blurDataUrl] = useNextBlurhash("LEHV6nWB2yk8pyo0adR*.7kCMdnj");
  let [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    setLoadingEvents(true);
    getEvents().then((res) => {
      setEvents(res);
      setLoadingEvents(false);
    });
  }, []);
  return (
    <main className="flex h-screen flex-col p-24">
      <div className="text-2xl font-semibold mb-5">Upcoming Events</div>
      {/* Event Cards */}
      {loadingEvents && (
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-orange-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {!loadingEvents && (
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
                  <Image
                    src={event.imageUrl}
                    height={300}
                    width={500}
                    blurDataURL={blurDataUrl}
                    placeholder="blur"
                  />
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
      )}
    </main>
  );
}
