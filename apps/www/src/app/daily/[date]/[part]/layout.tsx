import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DrillProvider } from "@/components/challenges/DrillProvider";
import { Skeleton } from "@/components/Skeleton";
import { isDateKey } from "@/dailyChallenge/date";
import { getDailyChallenge } from "@/dailyChallenge/getDailyChallenge";
import { isDailyPart } from "@/dailyChallenge/parts";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ date: string; part: string }>;
}) {
  return (
    <Suspense fallback={<DailyPartSkeleton />}>
      <DailyPartData params={params}>{children}</DailyPartData>
    </Suspense>
  );
}

async function DailyPartData({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ date: string; part: string }>;
}) {
  const { date, part } = await params;
  if (!isDateKey(date) || !isDailyPart(part)) notFound();
  const dailyChallenge = await getDailyChallenge(date);
  const isWords = part === "words";
  return (
    <DrillProvider
      courseTitle="Daily Challenge"
      lessonTitle={date}
      drillTitle={isWords ? "Daily Words" : "Daily Phrases"}
      description={null}
      words={isWords ? dailyChallenge.words : []}
      phrases={isWords ? [] : dailyChallenge.phrases}
      courseSlug="daily"
      lessonSlug={date}
      drillSlug={`daily-${date}-${part}`}
      homeHref={`/daily/${date}/${part}`}
    >
      {children}
    </DrillProvider>
  );
}

function DailyPartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="py-1">
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
