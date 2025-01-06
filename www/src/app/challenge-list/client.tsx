"use client";
import {
  useTimeAttackPB,
  usePracticeCount,
  formatPracticeCount,
} from "@/utils/playerStats";
import { formatTimeAttackMs } from "@/utils/playerStats";

export function PracticeCountCell({ challengeId }: { challengeId: string }) {
  const [practiceCount] = usePracticeCount(challengeId);
  return <div className="text-end">{formatPracticeCount(practiceCount)}</div>;
}
export function TimeAttackCell({ challengeId }: { challengeId: string }) {
  const [timeAttackPB] = useTimeAttackPB(challengeId);
  return (
    <div className="text-end">
      {timeAttackPB === null ? "N/A" : formatTimeAttackMs(timeAttackPB)}
    </div>
  );
}
