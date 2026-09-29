"use client";
import { ListChecks, Timer } from "lucide-react";
import { DrillContent } from "@/components/challenges/DrillContent";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { ModeOption } from "@/components/ModeOption";
import {
  formatPracticeCount,
  formatTimeAttackMs,
  usePracticeCount,
  useTimeAttackPB,
} from "@/utils/playerState";

export function DrillHome() {
  const { challengeId, courseSlug, lessonSlug } = useDrillContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <>
      <section className="flex w-full flex-col gap-2">
        <div className="flex flex-col gap-4 lg:flex-row">
          <ModeOption
            href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}/practice`}
            icon={<ListChecks className="h-full w-full" />}
            title="Practice"
            subtitle={formatPracticeCount(practiceCount)}
          />
          <ModeOption
            href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}/time-attack`}
            icon={<Timer className="h-full w-full" />}
            title="Time Attack"
            subtitle={formatTimeAttackMs(timeAttackPb)}
          />
        </div>
      </section>
      <DrillContent />
    </>
  );
}
