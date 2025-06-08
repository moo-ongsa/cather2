"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import darkIcon from "../../../public/dark.svg";
import lightIcon from "../../../public/light.svg";

const ThemeSwitch = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState();

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <p className="fixed right-0 mt-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5">
        ...
      </p>
    );
  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
      className="fixed right-0 mt-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
    >
      {resolvedTheme === "dark" ? (
        <Image key="light-mode" src={lightIcon} alt="Light mode" />
      ) : (
        <Image key="dark-mode" src={darkIcon} alt="Dark mode" />
      )}
    </button>
  );
};

export default ThemeSwitch;
