"use client";
import { clamp } from "@/challenges/util";
import { PlayerAwardIcon, awardColors } from "@/components/CompletionAward";
import { Challenge } from "@/components/challenges/Challenge";
import { useDrillContext } from "@/components/challenges/ChallengeContext";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import {
  bronzePracticeCount,
  formatPracticeCount,
  goldPracticeCount,
  practiceCountTillNextValues,
  practiceCountToAward,
  silverPracticeCount,
  totalTillBronze,
  totalTillSilver,
  usePracticeCount,
} from "@/utils/playerStats";
import { AnimatePresence, animate, useMotionValue, useTransform, motion, usePresence } from "motion/react";
import { type Ref, useEffect, useState } from "react";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

export default function Practice() {
  const { challengeId } = useDrillContext();
  const { problem, nextProblem, initializing } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const [started, setStarted] = useState(false);
  if (initializing) return null;
  const onProblemComplete = () => {
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
    <div className="md:grid-stack relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div className="grid-stack-item justify-start self-start">
        <ExitButton onExit={() => setStarted(false)} />
      </div>
      <div className="grid-stack-item flex flex-col items-center self-center justify-self-center">
        <AnimatePresence mode="popLayout">
          <Challenge onProblemComplete={onProblemComplete} challenge={problem} active practice />
        </AnimatePresence>
      </div>
      <ProgressArea practiceCount={practiceCount} />
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
      <ProgressBars count={practiceCount} />
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
      const controls = animate(currentlyShownPercent, percent, { duration: 0.2 });
      return () => controls.stop();
    }
    // if we're being removed, it's means we reached 100%. do a lil animation.
    const controls = animate(currentlyShownPercent, 1, { duration: 0.2 });
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

function CoreProgressBar({
  current,
  total,
  color,
}: {
  current: number;
  total: number;
  color: string;
}) {
  const percentFill = (current / total) * 100;
  return (
    <div className="grid-stack h-4 w-full overflow-hidden border border-black border-t-0 first:border-t">
      <div className="grid-stack-item h-full w-full" style={{ background: color }} />
      <div
        className="grid-stack-item h-full bg-green-500 transition-all"
        style={{ width: `${percentFill}%` }}
      />
    </div>
  );
}

function ProgressBars({ count }: { count: number }) {
  const bronzeProgress = clamp(count, 0, bronzePracticeCount);
  const silverProgress = clamp(count - totalTillBronze, 0, silverPracticeCount);
  const goldProgress = clamp(count - totalTillSilver, 0, goldPracticeCount);
  return (
    <div className="-skew-x-[30deg] flex w-full flex-col">
      <CoreProgressBar color={awardColors.bronze} current={bronzeProgress} total={bronzePracticeCount} />
      <CoreProgressBar color={awardColors.silver} current={silverProgress} total={silverPracticeCount} />
      <CoreProgressBar color={awardColors.gold} current={goldProgress} total={goldPracticeCount} />
    </div>
  );
}
