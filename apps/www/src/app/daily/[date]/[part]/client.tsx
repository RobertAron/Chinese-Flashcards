"use client";
import { CheckIcon, ListChecks } from "lucide-react";
import { useParams } from "next/navigation";
import { Breadcrumb, BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { DrillContent } from "@/components/challenges/DrillContent";
import { ModeOption } from "@/components/ModeOption";
import { formatDateKey } from "@/dailyChallenge/date";
import { type DailyPart, dailyPartInfo, dailyParts } from "@/dailyChallenge/parts";
import { useDailyChallengeProgress } from "@/utils/playerState";

export default function DailyPartHome() {
  const { date, part } = useParams<{ date: string; part: DailyPart }>();
  const [progress] = useDailyChallengeProgress(date);
  const info = dailyPartInfo[part];
  const done = progress[part] === true;
  return (
    <>
      <BreadcrumbContainer>
        <Breadcrumb href="/">Home</Breadcrumb>
        <BreadcrumbEscape href={`/daily/${date}`}>Daily Challenge</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex w-full flex-col items-start gap-4 py-2">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest">
            Part {info.number} of {dailyParts.length} ·{" "}
            {formatDateKey(date, { month: "long", day: "numeric" })}
          </p>
          <h1 className="font-bold text-5xl underline">{info.title}</h1>
        </div>
        <section className="flex w-full">
          <ModeOption
            href={`/daily/${date}/${part}/practice`}
            icon={done ? <CheckIcon className="h-full w-full" /> : <ListChecks className="h-full w-full" />}
            title={done ? "Practice again" : "Start"}
            subtitle={done ? "COMPLETED" : "NOT STARTED"}
          />
        </section>
        <DrillContent />
      </main>
    </>
  );
}
