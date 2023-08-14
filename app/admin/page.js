"use client";
import React, { useEffect, useState } from "react";
import { url } from "../page";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Admin() {
  let [user, setUser] = useState(null);
  let [ticketsCounts, setTicketsCounts] = useState(null);
  let [ticketsTotals, setTicketsTotals] = useState(null);
  let [totalValueSold, setTotalValueSold] = useState(0);
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  useEffect(() => {
    let total = 0;
    setUser(JSON.parse(localStorage.getItem("user")));
    fetch(`${url}/tickets/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("reeees", res);
        let totals = res?.map((r) => {
          total += r.total;
          return r.total;
        });

        setTotalValueSold(total);

        let counts = res?.map((r) => {
          return r.count;
        });

        let lables = res?.map((r) => {
          return r._id;
        });

        let totalsPie = {
          labels: lables,
          datasets: [
            {
              label: "Total",
              data: totals,
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(255, 159, 64, 0.5)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        let countsPie = {
          labels: lables,
          datasets: [
            {
              label: "Counts",
              data: counts,
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(255, 159, 64, 0.5)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        setTicketsCounts(countsPie);
        setTicketsTotals(totalsPie);
      })
      .catch((err) => {});
  }, []);

  function login() {
    if (password === "password@Josh2023" && username==='admin') {
      localStorage.setItem(
        "user",
        JSON.stringify({
          username,
          password,
        })
      );
      setUser(
        JSON.stringify({
          username,
          password,
        })
      );
    } else {
      alert('Check username/password');
    }
  }
  return (
    <>
      {user && (
        <div className="flex flex-col py-5 px-10 md:px-36 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {user && (
              <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-center items-center space-y-3">
                <div>Totals by Package</div>
                {ticketsTotals && <Pie data={ticketsTotals} />}
              </div>
            )}

            {user && (
              <div className="bg-white p-5 rounded shadow-sm flex flex-col justify-center items-center space-y-3">
                <div>Counts by Package</div>
                {ticketsCounts && <Bar data={ticketsCounts} />}
              </div>
            )}

            {user && (
              <div className="flex flex-col  space-y-3">
                <div className="bg-white p-5 rounded-sm">
                  Total: {totalValueSold.toLocaleString()} RWF
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!user && (
        <section className="bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Sign in to your account
                </h1>
                <form
                  className="space-y-4 md:space-y-6"
                >
                  <div>
                    <label
                      for="email"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your username
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="username"
                      required=""
                    />
                  </div>
                  <div>
                    <label
                      for="password"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required=""
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                          required=""
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          for="remember"
                          className="text-gray-500 dark:text-gray-300"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <button
                    // type="submit"
                    onClick={login}
                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    Sign in
                  </button>
                  {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don’t have an account yet?{" "}
                    <a
                      href="#"
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                    >
                      Sign up
                    </a>
                  </p> */}
                </form>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
