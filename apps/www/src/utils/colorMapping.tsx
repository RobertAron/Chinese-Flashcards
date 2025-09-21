import { ChevronsUpIcon, CrownIcon, Squircle } from "lucide-react";

export const practiceCountColors = {
  0: {
    key: 0,
    min: 1,
    max: 99,
    background: "bg-blue-300",
    primary: "bg-blue-600",
    font: "text-blue-600",
  },
  1: {
    key: 1,
    min: 100,
    max: 249,
    background: "bg-green-300",
    primary: "bg-green-600",
    font: "text-green-600",
  },
  2: {
    key: 2,
    min: 250,
    max: 499,
    background: "bg-yellow-300",
    primary: "bg-yellow-600",
    font: "text-yellow-600",
  },
  3: {
    key: 3,
    min: 500,
    max: Number.POSITIVE_INFINITY,
    background: "bg-red-300",
    primary: "bg-red-600",
    font: "text-red-600",
  },
} as const;

export function practiceCountToColor(count: number | null) {
  if (count === 0 || count === null) return null;
  if (count < 100) return practiceCountColors[0];
  if (count < 250) return practiceCountColors[1];
  if (count < 500) return practiceCountColors[2];
  return practiceCountColors[3];
}

export function PracticeCountIcon({ count, large }: { count: number | null; large?: boolean }) {
  const sizeClasses = large ? "w-8 h-8" : "w-4 h-4";
  const className = practiceCountToColor(count);
  return className === null ? (
    <Squircle strokeWidth={3} className={`${sizeClasses} text-gray-600`} />
  ) : (
    <CrownIcon strokeWidth={3} className={`${sizeClasses} ${className.font}`} />
  );
}

export const timeAttackColors = {
  0: {
    key: 0,
    requiredTime: 100 * 1000,
    background: "bg-blue-300",
    primary: "bg-blue-600",
    font: "text-blue-600",
  },
  1: {
    key: 1,
    requiredTime: 75 * 1000,
    background: "bg-green-300",
    primary: "bg-green-600",
    font: "text-green-600",
  },
  2: {
    key: 2,
    requiredTime: 50 * 1000,
    background: "bg-yellow-300",
    primary: "bg-yellow-600",
    font: "text-yellow-600",
  },
  3: {
    key: 3,
    requiredTime: 25 * 1000,
    background: "bg-red-300",
    primary: "bg-red-600",
    font: "text-red-600",
  },
} as const;

export function timeAttackCountToColor(timeMs: number | null) {
  if (timeMs === null) return null;
  if (timeMs <= timeAttackColors[3].requiredTime) return timeAttackColors[3];
  if (timeMs <= timeAttackColors[2].requiredTime) return timeAttackColors[2];
  if (timeMs <= timeAttackColors[1].requiredTime) return timeAttackColors[1];
  if (timeMs <= timeAttackColors[0].requiredTime) return timeAttackColors[0];
  return null;
}

export function TimeAttackIcon({ timeMs, large }: { timeMs: number | null; large?: boolean }) {
  const className = timeAttackCountToColor(timeMs);
  const sizeClasses = large ? "w-8 h-8" : "w-4 h-4";
  return className === null ? (
    <Squircle strokeWidth={3} className={`${sizeClasses} text-gray-600`} />
  ) : (
    <ChevronsUpIcon strokeWidth={3} className={`${sizeClasses} ${className.font}`} />
  );
}
