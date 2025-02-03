"use client";
import { clamp } from "@/challenges/util";
import { AppServerEntrypoint } from "@/components/AppPage";
import { PlayerAwardIcon, awardColors } from "@/components/CompletionAward";
import { Challenge } from "@/components/challenges/Challenge";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import {
  bronzePracticeCount,
  formatPracticeCount,
  goldPracticeCount,
  practiceCountToAward,
  silverPracticeCount,
  totalTillBronze,
  totalTillSilver,
  usePracticeCount,
} from "@/utils/playerStats";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

export default AppServerEntrypoint(() => {
  const { challengeId } = useChallengeContext();
  const { problem, nextProblem, initializing } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const [started, setStarted] = useState(false);
  if (initializing) return null;
  const onProblemComplete = () => {
    setPracticeCount(practiceCount + 1);
    nextProblem();
  };
  return (
    <main className="p-1">
      {!started ? (
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
        <div className="grid-stack relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
          <div className="grid-stack-item justify-start self-start p-2">
            <ExitButton onExit={() => setStarted(false)} />
          </div>
          <div>
            <PlayerAwardIcon awardType={practiceCountToAward(practiceCount)} />
            {formatPracticeCount(practiceCount)}
          </div>
          <ProgressBars count={practiceCount} />
          <div className="grid-stack-item flex flex-col items-center self-start justify-self-center">
            <AnimatePresence mode="popLayout">
              <Challenge onProblemComplete={onProblemComplete} challenge={problem} active practice />
            </AnimatePresence>
          </div>
        </div>
      )}
    </main>
  );
});

function CoreProgressBar({
  current,
  total,
  color,
}: {
  current: number;
  total: number;
  color: string;
}) {
  return (
    <div className="grid-stack h-1 w-full skew-x-12 bg-black">
      <div className="grid-stack-item h-full w-full" style={{ background: color }} />
      <div
        className="grid-stack-item h-full bg-green-500 transition-all"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

function ProgressBars({ count }: { count: number }) {
  const bronzeProgress = clamp(count, 0, bronzePracticeCount);
  const silverProgress = clamp(count - totalTillBronze, 0, silverPracticeCount);
  const goldProgress = clamp(count - totalTillSilver, 0, goldPracticeCount);
  return (
    <div className="flex w-full flex-col gap-[.5px]">
      <CoreProgressBar color={awardColors.bronze} current={bronzeProgress} total={bronzePracticeCount} />
      <CoreProgressBar color={awardColors.silver} current={silverProgress} total={silverPracticeCount} />
      <CoreProgressBar color={awardColors.gold} current={goldProgress} total={goldPracticeCount} />
    </div>
  );
}
