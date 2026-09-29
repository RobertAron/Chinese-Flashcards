"use client";
import { useSyncExternalStore } from "react";
import { utcDateKey } from "./date";

function subscribe(onChange: () => void) {
  const interval = setInterval(onChange, 60_000);
  return () => clearInterval(interval);
}

/** Today's UTC date key, or null during server render and hydration. */
export function useToday(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => utcDateKey(new Date()),
    () => null,
  );
}
