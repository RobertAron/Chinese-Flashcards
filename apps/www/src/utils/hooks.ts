"use client";
import { useCallback, useEffect, useState } from "react";

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

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stringifiedDefaultValue = JSON.stringify(defaultValue);
  // State to store the value
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  useEffect(() => {
    setStoredValue(getLocalStorage<T>(key, stringifiedDefaultValue));
  }, [key, stringifiedDefaultValue]);
  const _setStoredValue = useCallback(
    (value: T) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    },
    [key],
  );

  return [storedValue, _setStoredValue] as const;
}
