import { clsx, type ClassValue } from "clsx";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export function useMergeClasses(base: string, inject?: string) {
  return useMemo(() => twMerge([base, inject]), [base, inject]);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}