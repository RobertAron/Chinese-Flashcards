import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names, letting later Tailwind classes override earlier ones. */
export const cn = (...args: Parameters<typeof clsx>) => twMerge(clsx(...args));
