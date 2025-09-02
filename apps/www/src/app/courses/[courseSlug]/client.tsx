"use client";
import { practiceCountToAward, timeAttackToAward, useFullPlayerState } from "@/utils/playerState";

export function LessonProgress({ drillSlugs }: { drillSlugs: string[] }) {
  const playerState = useFullPlayerState();
  const practiceAwards = drillSlugs
    .map((ele) => playerState.challengePracticeCounts[ele])
    .filter((ele) => ele !== undefined)
    .map((ele) => practiceCountToAward(ele));
  const timeAwards = drillSlugs
    .map((ele) => playerState.challengeTimeAttackPB[ele])
    .filter((ele) => ele !== undefined)
    .map((ele) => timeAttackToAward(ele));
  const allAwards = [...practiceAwards, ...timeAwards].reduce(
    (acc, next) => {
      if (next !== null) acc[next] += 1;
      return acc;
    },
    { bronze: 0, silver: 0, gold: 0 },
  );
  return (
    <div className="flex justify-end text-lg gap-2">
      <div>🏅{allAwards.gold}x</div>
      <div>🥈{allAwards.silver}x</div>
      <div>🥉{allAwards.bronze}x</div>
    </div>
  );
}
