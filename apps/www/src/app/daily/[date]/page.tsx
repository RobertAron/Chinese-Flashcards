import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BreadcrumbContainer, BreadcrumbEscape } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/Skeleton";
import { formatDateKey, isDateKey } from "@/dailyChallenge/date";
import { getDailyChallenge } from "@/dailyChallenge/getDailyChallenge";
import { DailyPartLink, DailyWeek } from "./client";

export default function Page({ params }: { params: Promise<{ date: string }> }) {
  return (
    <>
      <BreadcrumbContainer>
        <BreadcrumbEscape href="/">Home</BreadcrumbEscape>
      </BreadcrumbContainer>
      <main className="flex w-full py-2">
        <Suspense fallback={<DailyChallengeSkeleton />}>
          <DailyChallengeData params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function DailyChallengeData({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isDateKey(date)) notFound();
  const challenge = await getDailyChallenge(date);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="rounded-md border-2 border-black bg-amber-200 p-4">
        <p className="font-mono text-sm uppercase tracking-widest">
          {formatDateKey(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="font-black text-4xl">Daily Challenge</h1>
        <p className="text-lg">Learn today's words, then use them in phrases.</p>
      </header>
      <DailyWeek dateKey={date} />
      <div className="grid gap-2">
        <DailyPartLink dateKey={date} part="words" count={challenge.words.length}>
          <ul className="flex flex-wrap gap-1">
            {challenge.words.map((word) => (
              <li className="rounded-sm border border-current px-1.5 text-xl" key={word.id}>
                {word.characters}
              </li>
            ))}
          </ul>
        </DailyPartLink>
        <DailyPartLink dateKey={date} part="phrases" count={challenge.phrases.length}>
          <ul className="flex flex-col">
            {challenge.phrases.map((phrase) => (
              <li className="truncate text-xl" key={phrase.id}>
                {phrase.characters}
              </li>
            ))}
          </ul>
        </DailyPartLink>
      </div>
    </div>
  );
}

function DailyChallengeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
