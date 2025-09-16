"use client";
import { CrownIcon } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useTransform } from "motion/react";
import { type Ref, useEffect, useState } from "react";
import { PlayerAwardIcon } from "@/components/CompletionAward";
import { Challenge } from "@/components/challenges/Challenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { Experience } from "@/components/Experience";
import { practiceCountColors, practiceCountToColor } from "@/utils/colorUtils";
import {
  formatPracticeCount,
  practiceCountTillNextValues,
  practiceCountToAward,
  usePracticeCount,
  useWordIncrementor,
} from "@/utils/playerState";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

function PracticeCountItem({ id, showRange }: { id: keyof typeof practiceCountColors; showRange?: boolean }) {
  const data = practiceCountColors[id];
  const minString = data.min.toString().padStart(4, " ");
  const maxString = data.max.toString().padStart(4, " ");
  return (
    <div className="flex items-center gap-1">
      <CrownIcon strokeWidth={3} className={`${practiceCountColors[id].font} h-8 w-8`} />
      {showRange && <pre>{`${minString} - ${maxString}`}</pre>}
    </div>
  );
}

export default function Practice() {
  const { challengeId } = useDrillContext();
  const { problem, nextProblem, initializing, noProblems } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const wordIncrementor = useWordIncrementor();
  const [started, setStarted] = useState(false);
  if (initializing) return null;
  if (!started)
    return (
      <ChallengeTitle
        onStart={() => setStarted(true)}
        improve={practiceCount !== 0}
        disableStart={noProblems}
      >
        <div className="flex gap-2">
          <div className="flex flex-col text-3xl font-bold grow basis-0">
            <PracticeCountItem id={3} showRange />
            <PracticeCountItem id={2} showRange />
            <PracticeCountItem id={1} showRange />
            <PracticeCountItem id={0} showRange />
          </div>
          <div className="text-3xl font-extrabold grow basis-0">
            <div className="flex items-center font-mono">
              <PracticeCountItem id={practiceCountToColor(practiceCount).key} />
              <span>{formatPracticeCount(practiceCount)}</span>
            </div>
          </div>
        </div>
      </ChallengeTitle>
    );
  if (noProblems) {
    console.error("Shouldn't be able to start challenge with no problems");
    return null;
  }
  const onProblemComplete = () => {
    wordIncrementor(problem.wordIds);
    setPracticeCount(practiceCount + 1);
    nextProblem();
  };
  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-2 align-middle grow">
      <div className="self-start justify-start">
        <ExitButton onExit={() => setStarted(false)} />
      </div>
      <ProgressArea practiceCount={practiceCount} />
      <div className="flex flex-col items-center self-stretch sm:self-center">
        <AnimatePresence mode="popLayout">
          <Challenge onComplete={onProblemComplete} challenge={problem} active practice key={problem.id} />
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProgressArea({ practiceCount }: { practiceCount: number }) {
  const tillNext = practiceCountTillNextValues(practiceCount);
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-end justify-between pl-4 font-mono">
        <span>
          <PlayerAwardIcon awardType={practiceCountToAward(practiceCount)} />
        </span>
        <div className="flex items-end gap-1">
          <span className="flex items-center text-2xl">
            <span>{tillNext.current}</span>
            {tillNext.requiredForNext !== null && (
              <>
                <span>/</span>
                <span>{tillNext.requiredForNext}</span>
              </>
            )}
          </span>
          {tillNext.requiredForNext !== null && (
            <PercentageComplete
              percent={tillNext.current / tillNext.requiredForNext}
              key={tillNext.requiredForNext}
            />
          )}
        </div>
      </div>
      <Experience percent={practiceCount} />
    </div>
  );
}

function PercentageComplete({ percent, ref }: { percent: number; ref?: Ref<HTMLDivElement> }) {
  const currentlyShownPercent = useMotionValue(percent);
  const [isPresent, safeToRemove] = usePresence();
  const formattedPercent = useTransform(() => {
    const actualNumber = currentlyShownPercent.get();
    const numberPart = (actualNumber * 100).toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    if (actualNumber === 1) return "✨ヽ(^ヮ^)ﾉ✨";
    return `(${numberPart}%)`;
  });
  useEffect(() => {
    if (isPresent) {
      // when the number changes, animate to the new number
      const controls = animate(currentlyShownPercent, percent, { duration: 0.5 });
      return () => controls.stop();
    }
    // if we're being removed, it's means we reached 100%. do a lil animation.
    const controls = animate(currentlyShownPercent, 1, { duration: 0.5 });
    setTimeout(() => {
      controls.stop();
      safeToRemove();
    }, 1.5 * 1000);
  }, [currentlyShownPercent, percent, isPresent, safeToRemove]);
  return (
    <motion.span ref={ref} className="text-gray-600 text-sm/6">
      {formattedPercent}
    </motion.span>
  );
}
