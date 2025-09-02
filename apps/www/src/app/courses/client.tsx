"use client";
import { ListChecks, Timer } from "lucide-react";
import { PlayerAwardIcon } from "@/components/CompletionAward";
import {
  formatPracticeCount,
  formatTimeAttackMs,
  practiceCountToAward,
  timeAttackToAward,
  usePracticeCount,
  useTimeAttackPB,
} from "@/utils/playerState";

export function PracticeCountCell({ challengeId }: { challengeId: string }) {
  const [practiceCount] = usePracticeCount(challengeId);
  const award = practiceCountToAward(practiceCount);
  return (
    <div className="flex items-center justify-end gap-2">
      <PlayerAwardIcon awardType={award} />
      <span>{formatPracticeCount(practiceCount)}</span>
      <ListChecks className="w-4 h-4" />
    </div>
  );
}
export function TimeAttackCell({ challengeId }: { challengeId: string }) {
  const [timeAttackPB] = useTimeAttackPB(challengeId);
  const award = timeAttackToAward(timeAttackPB);
  return (
    <div className="flex items-center justify-end gap-2">
      <PlayerAwardIcon awardType={award} />
      <span>{formatTimeAttackMs(timeAttackPB)}</span>
      <Timer className="w-4 h-4" />
    </div>
  );
}
