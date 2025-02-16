"use client";
import { useReadLocalStorages } from "@/utils/hooks";
import { practiceCountToAward, timeAttackToAward } from "@/utils/playerStats";

export function LessonProgress({ drillSlugs }: { drillSlugs: string[] }) {
  const practiceCountChallengeIds = drillSlugs.map((ele) => `${ele}-practice-count`);
  const timeAttackChallengeIds = drillSlugs.map((ele) => `${ele}-best-time-attack-time`);
  const practiceCountScores = useReadLocalStorages(practiceCountChallengeIds, 0);
  const timeAttackScores = useReadLocalStorages(timeAttackChallengeIds, Number.MAX_SAFE_INTEGER);

  const practiceAwards = practiceCountScores.map((ele) => practiceCountToAward(ele));
  const timeAwards = timeAttackScores.map((ele) => timeAttackToAward(ele));
  const allAwards = [...practiceAwards, ...timeAwards].reduce(
    (acc, next) => {
      if (next !== null) acc[next] += 1;
      return acc;
    },
    { bronze: 0, silver: 0, gold: 0 },
  );
  return (
    <div className="flex justify-end gap-2 text-lg">
      <div>🏅{allAwards.gold}x</div>
      <div>🥈{allAwards.silver}x</div>
      <div>🥉{allAwards.bronze}x</div>
    </div>
  );
}
