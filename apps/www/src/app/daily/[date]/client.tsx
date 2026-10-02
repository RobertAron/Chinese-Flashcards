"use client";
import { ArrowRightIcon, CheckIcon, FlameIcon } from "lucide-react";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { formatDateKey, shiftDateKey } from "@/dailyChallenge/date";
import { type DailyPart, dailyPartInfo, dailyParts } from "@/dailyChallenge/parts";
import { useToday } from "@/dailyChallenge/useToday";
import { cn } from "@/utils/cn";
import { Link } from "@/utils/NextNavigationUtils";
import {
  type DailyChallengeProgress,
  dailyStreak,
  isDailyChallengeComplete,
  useAllDailyChallengeProgress,
  useDailyChallengeProgress,
} from "@/utils/playerState";

export function DailyPartLink({
  dateKey,
  part,
  count,
  children,
}: {
  dateKey: string;
  part: DailyPart;
  count: number;
  children?: React.ReactNode;
}) {
  const [progress] = useDailyChallengeProgress(dateKey);
  const info = dailyPartInfo[part];
  const done = progress[part] === true;
  const upNext = dailyParts.find((ele) => progress[ele] !== true) === part;
  return (
    <Link
      href={`/daily/${dateKey}/${part}`}
      className={cn(
        buttonBehaviorClasses,
        "grid hocus:scale-[101%] pressed:scale-[101%] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-4 transition-[scale] duration-100",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-current font-black text-2xl">
        {done ? <CheckIcon strokeWidth={3} /> : info.number}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-3xl">{info.title}</h2>
          {done && <StatusPill className="bg-green-300">Done</StatusPill>}
          {upNext && <StatusPill className="bg-amber-200">Up next</StatusPill>}
        </div>
        {children}
        <p className="font-mono text-sm">
          {count} {part}
        </p>
      </div>
      <ArrowRightIcon className="h-8 w-8" />
    </Link>
  );
}

function StatusPill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full border-2 border-black px-2 font-bold font-mono text-black text-xs uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DailyWeek({ dateKey }: { dateKey: string }) {
  const today = useToday();
  const allProgress = useAllDailyChallengeProgress();
  const days = Array.from({ length: 7 }, (_, index) => shiftDateKey(today ?? dateKey, index - 6));
  const streak = today === null ? 0 : dailyStreak(allProgress, today);
  return (
    <section className="flex flex-col gap-2 rounded-md border-2 border-black bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-lg">This week</h2>
        <p className="flex items-center gap-1 font-mono">
          <FlameIcon className={cn("h-5 w-5", streak > 0 ? "text-orange-600" : "text-gray-400")} />
          {streak > 0 ? `${streak}-day streak` : "No streak yet"}
        </p>
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <li key={day}>
            <DayStatus day={day} progress={allProgress[day]} />
          </li>
        ))}
      </ol>
      {today !== null && dateKey < today && (
        <Link href={`/daily/${today}`} className="self-start hocus:text-gray-600 underline">
          This is a past challenge. Go to today's challenge.
        </Link>
      )}
    </section>
  );
}

function DayStatus({ day, progress }: { day: string; progress: DailyChallengeProgress | undefined }) {
  const complete = isDailyChallengeComplete(progress);
  const started =
    !complete &&
    dailyParts.some((part) => progress?.[part] === true || (progress?.answered?.[part] ?? 0) > 0);
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md border-2 border-black py-1 font-mono",
        complete ? "bg-black text-white" : started ? "bg-amber-200" : "bg-white",
      )}
    >
      <span className="text-xs uppercase">{formatDateKey(day, { weekday: "short" })}</span>
      <span className="font-bold text-lg">{formatDateKey(day, { day: "numeric" })}</span>
      {complete ? <CheckIcon className="h-4 w-4" strokeWidth={3} /> : <span className="h-4" />}
      <span className="sr-only">{complete ? "Complete" : started ? "Started" : "Not done"}</span>
    </div>
  );
}
