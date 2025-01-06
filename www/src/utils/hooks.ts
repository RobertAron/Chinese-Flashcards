"use client";
import { useCallback, useEffect, useState } from "react";

function getLocalStorage<T>(key: string, defaultValue: T) {
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? defaultValue : JSON.parse(item);
  } catch (error) {
    if (typeof window !== "undefined")
      console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // State to store the value
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  useEffect(() => {
    setStoredValue(getLocalStorage(key, defaultValue));
  }, [key, defaultValue]);
  const _setStoredValue = useCallback(
    (value: T) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    },
    [key],
  );

  return [storedValue, _setStoredValue] as const;
}
