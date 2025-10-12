"use client";
import {
  PracticeCountIcon,
  practiceCountColors,
  practiceCountToColor,
  TimeAttackIcon,
  timeAttackColors,
  timeAttackCountToColor,
} from "@/utils/colorMapping";
import { useFullPlayerState } from "@/utils/playerState";

export function LessonProgress({ drillSlugs }: { drillSlugs: string[] }) {
  const playerState = useFullPlayerState();
  const practiceAwards = drillSlugs
    .map((ele) => playerState.challengePracticeCounts[ele])
    .filter((ele) => ele !== undefined)
    .map((ele) => practiceCountToColor(ele)?.key)
    .filter((ele) => ele !== undefined);
  const timeAwards = drillSlugs
    .map((ele) => playerState.challengeTimeAttackPB[ele])
    .filter((ele) => ele !== undefined)
    .map((ele) => timeAttackCountToColor(ele)?.key)
    .filter((ele) => ele !== undefined);
  const allAwards = [...practiceAwards, ...timeAwards].reduce(
    (acc, next) => {
      if (next !== null) acc[next] += 1;
      return acc;
    },
    { 0: 0, 1: 0, 2: 0, 3: 0 },
  );
  // TODO NEXT
  // Make keep medals?
  return (
    <div className="flex flex-col justify-end gap-0.5 justify-self-end text-lg">
      <div className="flex items-center">
        <PracticeCountIcon count={practiceCountColors[3].min} />
        <TimeAttackIcon timeMs={timeAttackColors[3].requiredTime} />
        <span>・</span>
        {allAwards[3]}
      </div>
      <div className="flex items-center">
        <PracticeCountIcon count={practiceCountColors[2].min} />
        <TimeAttackIcon timeMs={timeAttackColors[2].requiredTime} />
        <span>・</span>
        {allAwards[2]}
      </div>
      <div className="flex items-center">
        <PracticeCountIcon count={practiceCountColors[1].min} />
        <TimeAttackIcon timeMs={timeAttackColors[1].requiredTime} />
        <span>・</span>
        {allAwards[1]}
      </div>
      <div className="flex items-center">
        <PracticeCountIcon count={practiceCountColors[0].min} />
        <TimeAttackIcon timeMs={timeAttackColors[0].requiredTime} />
        <span>・</span>
        {allAwards[0]}
      </div>
    </div>
  );
}
