import { clsx, type ClassValue } from "clsx";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function useMergeClasses(...items: string[]) {
  const classes = items.join(" ");
  return useMemo(() => twMerge(classes), [classes]);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
