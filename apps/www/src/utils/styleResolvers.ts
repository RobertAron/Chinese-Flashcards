import { type ClassValue, clsx } from "clsx";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function useTailwindOverride(...items: ClassValue[]) {
  const classes = clsx(items);
  return useMemo(() => {
    // mildly complicated calculation. Memo.
    return twMerge(classes);
  }, [classes]);
}
