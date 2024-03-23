"use client";
import React, { useEffect, useState } from "react";
import useNextBlurhash from "use-next-blurhash";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { url } from "@/app/page";
import dayjs from "dayjs";
import { motion } from "framer-motion";

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

export const buidLoader = (
  // <div
  //   class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-orange-100 motion-reduce:animate-[spin_1.5s_linear_infinite]"
  //   role="status"
  // >
  //   <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
  //     Loading...
  //   </span>
  // </div>

  <div className="flex flex-col items-center justify-center">
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 mr-2 text-gray-100 animate-spin fill-orange-600"
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
  </div>
);
export async function getEventDetails(ticketId, setLoadingDetails) {
  setLoadingDetails(true);
  return fetch(`${url}/events/${ticketId}`, {
    headers: {
      Content: "application/json",
    },
  });
}
export default function Event({ params }) {
  let [event, setEvent] = useState(null);
  const [blurDataUrl] = useNextBlurhash("L6PZfSi_.AyE_3t7t7R**0o#DgR4");
  let [loadingEventDetails, setLoadingEventDetails] = useState(true);
  let [eventPackage, setPackage] = useState({});
  let [telephone, setTelephone] = useState(null);
  let [submittng, setSubmitting] = useState(false);
  let [paymentStatus, setPaymentStatus] = useState(null);
  let [paymentRef, setPaymentRef] = useState(null);
  let [paymentStatusReason, setPaymentStatusReason] = useState(null);
  let router = useRouter();

  async function requestToPay() {
    setSubmitting(true);
    setPaymentStatus(null);
    if (telephone.length !== 9 || telephone.charAt(0) !== "7") {
      alert("Please check the telephone entered and try again.");
      setSubmitting(false);
    } else {
      return fetch(`${url}/momo/requestToPay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: eventPackage?.price,
          currency: "RWF",
          externalId: 123345,
          payer: {
            partyIdType: "MSISDN",
            partyId: `250${telephone}`,
          },
          payerMessage: `Buying ${eventPackage?.title} ticket for ${event?.title}`,
          payeeNote: "Note",
        }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            let err = { status: res.status, statusText: res.statusText };
            throw Error(JSON.stringify(err));
          }
        })
        .then((res) => {
          setPaymentRef(res?.refId);
          setPaymentStatus("pending");
          setTimeout(async () => {
            await getPaymentStatus(res?.refId);
          }, 15000);
        })
        .catch((err) => {
          console.log(url, err);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  }

  useEffect(() => {}, [paymentRef]);

  async function getPaymentStatus(ref) {
    setSubmitting(true);
    return fetch(
      `${url}/momo/statusOfRequest/${ref}?title=${eventPackage?.title}&currency=${eventPackage?.currency}&price=${eventPackage?.price}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          let err = { status: res.status, statusText: res.statusText };
          throw Error(JSON.stringify(err));
        }
      })
      .then(async (res) => {
        let newStatus = res?.status;

        if (newStatus == "PENDING") {
          await getPaymentStatus(ref);
        } else {
          setPaymentStatus(res?.status);
          setPaymentStatusReason(res?.reason);

          if (newStatus == "SUCCESSFUL") {
            setTimeout(() => {
              router.push("/");
            }, 5000);
          }
        }
      })
      .catch((err) => {
        console.log(url, err);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  useEffect(() => {
    getEventDetails(params?.id, setLoadingEventDetails)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          console.log(res.statusText);
        }
      })
      .then((res) => {
        setEvent(res);
      })
      .finally(() => {
        setLoadingEventDetails(false);
      });
  }, [params]);

  const breakLine = <div className="h-[0.5px] w-full bg-gray-200"></div>;

  return (
    <>
      {!loadingEventDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 py-5 px-10 md:px-36 md:py-10 gap-10">
          <div className="md:col-span-2 flex flex-col">
            {!eventPackage?.price && (
              <div className="w-full mb-5">
                <Image
                  src={event?.imageUrl}
                  className="rounded-md"
                  height={100}
                  width={500}
                  placeholder="blur"
                  blurDataURL={blurDataUrl}
                  alt="Event banner"
                />
              </div>
            )}

            {/* packages */}
            <div className="rounded-md bg-white flex flex-col py-5 px-8">
              <div className="flex flex-row items-center justify-between">
                <div>Packages</div>
                {eventPackage?.price && (
                  <div
                    onClick={() => setPackage({})}
                    className="text-xs underline hover:text-blue-500 cursor-pointer"
                  >
                    Show all{" "}
                  </div>
                )}
              </div>

              {eventPackage?.price && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                  {event?.packages
                    ?.filter((ep) => ep?.price === eventPackage?.price)
                    .map((eventPackage) => {
                      return (
                        <div
                          className="flex flex-col p-2 ring-1 ring-amber-500 rounded-md justify-center items-center space-y-3"
                          onClick={() => {
                            setPackage(eventPackage);
                          }}
                        >
                          <div className="text-sm font-semibold capitalize">
                            {eventPackage?.title.toUpperCase()}
                          </div>
                          <div className="text-base font-semibold">
                            {eventPackage?.price?.toLocaleString()}{" "}
                            {eventPackage?.currency}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              {!eventPackage?.price && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                  {event?.packages?.map((eventPackage) => {
                    return (
                      <div className="flex flex-col p-2 ring-1 ring-amber-500 rounded-md justify-center items-center space-y-3">
                        <div className="text-sm font-semibold capitalize">
                          {eventPackage?.title.toUpperCase()}
                        </div>
                        <div className="text-base font-semibold">
                          {eventPackage?.price?.toLocaleString()}{" "}
                          {eventPackage?.currency}
                        </div>
                        {eventPackage?.soldOut && (
                          <div className="p-2 rounded-md bg-amber-100 w-full justify-center items-center flex m-5 cursor-not-allowed shadow-sm">
                            Sold out
                          </div>
                        )}
                        {!eventPackage?.price && (
                          <div
                            onClick={() => {
                              setPackage(eventPackage);
                            }}
                            className="p-2 rounded-md bg-amber-400 w-full justify-center items-center flex m-5 cursor-pointer shadow-sm"
                          >
                            Buy
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {/* Payment Form */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: eventPackage?.price ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  type: "tween",
                  ease: "circOut",
                }}
                className="flex flex-col mt-4"
              >
                {eventPackage?.price && (
                  <div className="rounded py-5 px-3 bg-white text-sm font-semibold">
                    <div className="flex flex-row items-center">
                      <div>Pay with</div>
                      <div>
                        <Image src="/images/mtn-2.png" height={50} width={50} />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="mt-4">
                        <form>
                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm mb-2"
                              for="tel"
                            >
                              Enter a telephone number for payment
                            </label>

                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                +250
                              </div>
                              <input
                                onChange={(e) => setTelephone(e.target.value)}
                                type="tel"
                                id="tel"
                                className="bg-gray-50 border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 block pl-14 p-2.5 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="78xxxxxx"
                              />
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-between">
                            <div>Total payment</div>
                            <div>
                              {eventPackage?.currency}{" "}
                              {eventPackage?.price?.toLocaleString()}
                            </div>
                          </div>

                          {!submittng &&
                            (paymentStatus?.toLowerCase() == "failed" ||
                              !paymentStatus) && (
                              <div
                                onClick={requestToPay}
                                role="button"
                                className="my-4 flex flex-row rounded bg-gray-600 text-white w-full items-center justify-center px-2 py-1 cursor-pointer"
                              >
                                Pay online
                              </div>
                            )}

                          {submittng && (
                            <div
                              role="button"
                              className="my-4 flex flex-row rounded bg-gray-400 text-white w-full items-center justify-center px-2 py-1 cursor-not-allowed"
                            >
                              Submitting
                            </div>
                          )}
                          {/* <input type="tel" className="py-1 px-2 rounded " /> */}
                        </form>
                      </div>
                    </div>

                    {/* We accept */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="font-thin">We Accept</div>
                      <div className="w-1/2 py-3">{breakLine}</div>
                      <Image src="/images/mtn.png" height={50} width={50} />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Payment Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: paymentStatus ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  type: "tween",
                  ease: "circOut",
                }}
                className="flex flex-col mt-4"
              >
                <div className="rounded py-5 px-3 bg-white text-sm font-semibold flex flex-col space-y-2">
                  <div>Payment {paymentStatus}</div>
                  {paymentStatus?.toLowerCase() === "successful" && (
                    <div className="p-2 bg-green-500 rounded text-sm font-normal text-white shadow ring-1 ring-white flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-11 h-11 text-white"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                        />
                      </svg>

                      <div className="">
                        Thank you for your ticket purchase. We are excited to
                        welcome you to the event! Kindly present the SMS
                        confirming your payment at the entrance for entry.
                      </div>
                    </div>
                  )}
                  {paymentStatus?.toLowerCase() === "failed" && (
                    <div className="p-2 bg-red-400 rounded text-sm font-normal text-white shadow ring-1 ring-white flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-11 h-11"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                        />
                      </svg>

                      <div className="">
                        Unfortunately, the transaction was unsuccessful. Please
                        make another attempt.
                      </div>
                    </div>
                  )}
                  {paymentStatus?.toLowerCase() === "pending" && (
                    <div className="p-2 bg-red-400 rounded text-sm font-normal text-white shadow ring-1 ring-white">
                      While you're in the process of the transaction, kindly
                      refrain from navigating away from this page.
                    </div>
                  )}
                  {paymentStatus?.toLowerCase() === "pending" && buidLoader}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
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
                      strokeWidth="0.8"
                      stroke="currentColor"
                      className="w-10 h-10 text-amber-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col text-sm font-thin">
                    <div className="font-light">Date and time</div>
                    <div>
                      {dayjs(event?.date).format("DD-MMM-YYYY hh:mm a")}
                    </div>
                  </div>
                </div>

                {breakLine}

                <div className="flex flex-row items-center space-x-5">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="0.8"
                      stroke="currentColor"
                      className="w-10 h-10 text-amber-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                      strokeWidth="0.8"
                      stroke="currentColor"
                      className="w-10 h-10 text-amber-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                      strokeWidth="0.8"
                      stroke="currentColor"
                      className="w-10 h-10 text-amber-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
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

            {/* details */}
          </div>
        </div>
      )}
      {loadingEventDetails && (
        <div className="h-screen grid content-center">{buidLoader}</div>
      )}
    </>
  );
}
