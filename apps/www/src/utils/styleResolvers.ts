import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function twCn(...items: ClassValue[]) {
  return twMerge(clsx(items));
}
