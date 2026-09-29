"use client";

import { ArrowRightIcon, CalendarCheckIcon, FlameIcon } from "lucide-react";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { formatDateKey } from "@/dailyChallenge/date";
import { dailyParts } from "@/dailyChallenge/parts";
import { useToday } from "@/dailyChallenge/useToday";
import { cn } from "@/utils/cn";
import { Link } from "@/utils/NextNavigationUtils";
import { dailyStreak, useAllDailyChallengeProgress } from "@/utils/playerState";

export function DailyChallengeLink() {
  const today = useToday();
  const allProgress = useAllDailyChallengeProgress();
  const progress = today === null ? undefined : allProgress[today];
  const partsDone = dailyParts.filter((part) => progress?.[part] === true).length;
  const streak = today === null ? 0 : dailyStreak(allProgress, today);
  const status =
    partsDone === dailyParts.length
      ? "Done for today. Come back tomorrow."
      : partsDone > 0
        ? `${partsDone} of ${dailyParts.length} parts done.`
        : "Three phrases and the words inside them.";
  return (
    <Link
      href="/daily"
      className={cn(
        buttonBehaviorClasses,
        "flex min-h-48 flex-col justify-between rounded-lg bg-amber-200 p-5",
      )}
    >
      <div className="flex items-start justify-between">
        <CalendarCheckIcon className="h-9 w-9" />
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full border-2 border-current px-2 py-1 font-bold font-mono text-sm">
            <FlameIcon className="h-4 w-4" />
            {streak}-day streak
          </span>
        )}
      </div>
      <div>
        <p className="h-5 font-mono text-sm">
          {today !== null && formatDateKey(today, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="font-black text-3xl">Daily Challenge</h2>
            <p>{status}</p>
          </div>
          <ArrowRightIcon className="h-8 w-8 shrink-0" />
        </div>
      </div>
    </Link>
  );
}
