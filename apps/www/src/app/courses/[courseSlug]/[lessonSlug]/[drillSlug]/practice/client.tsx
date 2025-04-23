"use client";
import { PlayerAwardIcon } from "@/components/CompletionAward";
import { Experience } from "@/components/Experience";
import { Challenge } from "@/components/challenges/Challenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import {
  bronzePracticeCount,
  formatPracticeCount,
  goldPracticeCount,
  practiceCountTillNextValues,
  practiceCountToAward,
  silverPracticeCount,
  usePracticeCount,
  useWordIncrementor,
} from "@/utils/playerState";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useTransform } from "motion/react";
import { type Ref, useEffect, useState } from "react";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

export default function Practice() {
  const { challengeId } = useDrillContext();
  const { problem, nextProblem, initializing } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const wordIncrementor = useWordIncrementor();
  const [started, setStarted] = useState(false);
  if (initializing) return null;
  const onProblemComplete = () => {
    wordIncrementor(problem.wordIds);
    setPracticeCount(practiceCount + 1);
    nextProblem();
  };
  return !started ? (
    <ChallengeTitle onStart={() => setStarted(true)} improve={practiceCount !== 0}>
      <div className="flex gap-2">
        <div className="flex grow basis-0 flex-col font-bold text-3xl">
          <div className="flex items-center gap-1">
            <PlayerAwardIcon awardType="gold" /> {goldPracticeCount}
          </div>
          <div className="flex items-center gap-1">
            <PlayerAwardIcon awardType="silver" /> {silverPracticeCount}
          </div>
          <div className="flex items-center gap-1">
            <PlayerAwardIcon awardType="bronze" /> {bronzePracticeCount}
          </div>
        </div>
        <div className="grow basis-0 font-extrabold text-3xl">
          <div className="flex items-center">
            <PlayerAwardIcon awardType={practiceCountToAward(practiceCount)} />
            {formatPracticeCount(practiceCount)}
          </div>
        </div>
      </div>
    </ChallengeTitle>
  ) : (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div className="justify-start self-start">
        <ExitButton onExit={() => setStarted(false)} />
      </div>
      <ProgressArea practiceCount={practiceCount} />
      <div className="flex flex-col items-center self-center justify-self-center">
        <AnimatePresence mode="popLayout">
          <Challenge onProblemComplete={onProblemComplete} challenge={problem} active practice />
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProgressArea({ practiceCount }: { practiceCount: number }) {
  const tillNext = practiceCountTillNextValues(practiceCount);
  return (
    <div className="flex w-full flex-col">
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
          <AnimatePresence mode="wait">
            {tillNext.requiredForNext !== null && (
              <PercentageComplete
                percent={tillNext.current / tillNext.requiredForNext}
                key={tillNext.requiredForNext}
              />
            )}
          </AnimatePresence>
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
