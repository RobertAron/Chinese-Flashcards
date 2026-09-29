"use client";
import { PracticeCountIcon, TimeAttackIcon } from "@/utils/colorMapping";
import {
  formatPracticeCount,
  formatTimeAttackMs,
  usePracticeCount,
  useTimeAttackPB,
} from "@/utils/playerState";

export function PracticeCountCell({ challengeId }: { challengeId: string }) {
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <div className="flex items-center justify-end gap-2">
      <span>{formatPracticeCount(practiceCount)}</span>
      <PracticeCountIcon count={practiceCount} />
    </div>
  );
}
export function TimeAttackCell({ challengeId }: { challengeId: string }) {
  const [timeAttackPB] = useTimeAttackPB(challengeId);
  return (
    <div className="flex items-center justify-end gap-2">
      <span>{formatTimeAttackMs(timeAttackPB)}</span>
      <TimeAttackIcon timeMs={timeAttackPB} />
    </div>
  );
}
