"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import moment from "moment";

import ThemeSwitch from "@/app/components/ThemeSwitch";

import clsx from "clsx";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState();
  const [rooms, setRooms] = useState([]);
  const [date, setDate] = useState(moment());

  useEffect(() => setMounted(true), []);

  const getRooms = async () => api.get("rooms");

  const initRooms = async () => {
    const { rooms } = await getRooms();
    setRooms(rooms);
  };

  useEffect(() => {
    const timerID = setInterval(() => setDate(moment()), 1000);
    return () => {
      clearInterval(timerID);
    };
  }, []);

  useEffect(() => {
    initRooms();
  }, []);

  const fetchNewRoom = async () => {
    const res = await fetch({
      method: "post",
    });
    if (!res.ok) return undefined;
    return res.json();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const roomName = e.target.roomName.value;
    const response = await api.post("rooms", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
    });

    router.push(`/meetingRoom/${response.room.id}`);
    setRooms([...rooms, response.room]);
  };

  const joinRoom = (id) => () => {
    router.push(`/meetingRoom/${id}`);
  };
  if (!mounted) return null;

  return (
    <main className="relative">
      <ThemeSwitch />
      <div
        id="meetings"
        className="absolute h-[520px] overflow-auto md:overflow-visible top-[250px] md:top-36 right-0 bottom-36 w-96 transition-transform transform ease-in-out duration-300"
      >
        {rooms.map(({ id, name, timeStamp, isNew }) => (
          <div
            key={id}
            className={clsx(
              "bg-cyan-400 transition-all duration-200 ease-in-out w-500 h-120 mb-5 pt-4 pr-6 pb-4 pl-3 opacity-1 rounded-l-lg hover:translate-x-7"
            )}
          >
            <h2 className="font-bold text-3xl mb-1">{name} Room</h2>
            <h3 className="font-extralight text-left mb-1 text-xs  whitespace-nowrap overflow-hidden text-ellipsis">
              {id}
            </h3>
            <button
              className="flex-shrink-0 text-1xl rounded-lg bg-blue-300 px-6 py-3 transition-all duration-200 ease-in-out cursor-pointer hover:px-8 hover:py-4 active:translate-y-5"
              onClick={joinRoom(id)}
            >
              JONIN US
            </button>
            <h3 className="font-extralight text-right text-xs mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {moment(timeStamp).format("MMMM Do YYYY, h:mm:ss a")}
            </h3>
          </div>
        ))}
      </div>

      <div className="fixed top-9 l-9 text-right">
        <h1 className="text-7xl font-bold min-w-300 h-20 block">
          Meeting Room
        </h1>
      </div>
      <div></div>
      <form
        className="w-full max-w-xl fixed top-44 md:t-auto md:bottom-10"
        onSubmit={onSubmit}
      >
        <div className="flex items-center border-b border-blue-300 py-2">
          <input
            className="appearance-none bg-transparent border-none w-full  placeholder-gray-400 mr-3 py-1 px-2 leading-tight focus:outline-none"
            name="roomName"
            type="text"
            placeholder="Room name"
            aria-label="Room name"
          />
          <button
            className="flex-shrink-0  text-2xl lg:text-xl rounded-lg bg-blue-300 px-6 py-3 transition-all duration-200 ease-in-out cursor-pointer hover:px-8 hover:py-4 active:translate-y-5 md:top-auto md:bottom-10"
            type="submit"
          >
            New Room
          </button>
        </div>
      </form>

      <div className="fixed bottom-2 left:36 md:bottom-36 md:left-36 text-left">
        <h1 className="font-normal text-xl">
          {moment(date).format("MMMM Do YYYY, h:mm:ss a")}
        </h1>
        <h2 className="font-extrabold text-5xl uppercase" id="time"></h2>
      </div>
    </main>
  );
}
