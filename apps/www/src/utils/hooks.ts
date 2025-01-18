"use client";
import { useEffect } from "react";
import useSWR from "swr";

function getLocalStorage<T = unknown>(
  key: string,
  stringifiedDefaultValue: string,
) {
  try {
    const item = window.localStorage.getItem(key) ?? stringifiedDefaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    if (typeof window !== "undefined")
      console.error("Error reading localStorage key", key, error);
    return JSON.parse(stringifiedDefaultValue) as T;
  }
}

const localStorageKey = Symbol("local-storage-hook");
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const { data = defaultValue, mutate } = useSWR(
    [localStorageKey, key],
    ([, key]) => {
      return getLocalStorage<T>(key, JSON.stringify(defaultValue));
    },
  );
  function setValue(newValue: T) {
    window.localStorage.setItem(key, JSON.stringify(newValue));
    mutate();
  }
  return [data, setValue] as const;
}

export function useKeyTrigger(key: string, cb: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) cb(event);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cb,key]);
}
