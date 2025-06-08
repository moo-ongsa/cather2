import { useEffect, useState } from "react";
export function useLocalStorage(key, fallbackValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return fallbackValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return fallbackValue
      return item ? JSON.parse(item) : fallbackValue;
    } catch (error) {
      // If error also return fallbackValue
      console.log(error);
      return fallbackValue;
    }
  });

  useEffect(() => {
    const setValue = (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    };

    if (storedValue) {
      setValue(storedValue);
    }
  }, [storedValue, key]);

  return [storedValue, setStoredValue];
}

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 1301,
    height: undefined,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};
