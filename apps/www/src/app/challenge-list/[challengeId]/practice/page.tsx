"use client";
import { AppPage } from "@/components/AppPage";
import { Challenge } from "@/components/challenges/Challenge";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import {
  bronzePracticeCount,
  formatPracticeCount,
  goldPracticeCount,
  silverPracticeCount,
  usePracticeCount,
} from "@/utils/playerStats";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";
import { clamp } from "@/challenges/util";

export default AppPage(({}) => {
  const { challengeId } = useChallengeContext();
  const { problem, nextProblem, initializing } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const [started, setStarted] = useState(false);
  if (initializing) return null;
  if (!started)
    return (
      <ChallengeTitle
        onStart={() => setStarted(true)}
        improve={practiceCount !== 0}
      >
        <div className="flex gap-2">
          <div className="flex grow basis-0 flex-col text-3xl font-bold">
            <div>🥇 500</div>
            <div>🥈 250</div>
            <div>🥉 100</div>
          </div>
          <div className="grow basis-0 text-3xl font-extrabold">
            {formatPracticeCount(practiceCount)}
          </div>
        </div>
      </ChallengeTitle>
    );
  const onProblemComplete = () => {
    setPracticeCount(practiceCount + 1);
    nextProblem();
  };
  return (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle grid-stack">
      <div className="justify-start self-start p-2 grid-stack-item">
        <ExitButton onExit={() => setStarted(false)} />
      </div>
      <div>{practiceCount}</div>
      <ProgressBar count={practiceCount} />
      <div className="flex flex-col items-center self-start justify-self-center grid-stack-item">
        <AnimatePresence mode="popLayout">
          <Challenge
            onProblemComplete={onProblemComplete}
            challenge={problem}
            active
            practice
          />
        </AnimatePresence>
      </div>
    </div>
  );
});

function SubProgress({
  subPercent,
  basis,
  className,
}: {
  subPercent: number;
  basis: number;
  className?: string;
}) {
  return (
    <div className={`h-full grow ${className}`} style={{ flexBasis: basis }}>
      <div
        className={`h-full bg-green-500 transition-all`}
        style={{ width: `${subPercent}%` }}
      />
    </div>
  );
}

function ProgressBar({ count }: { count: number }) {
  // prettier-ignore
  const bronzePercent = clamp(count / bronzePracticeCount,0,1)*100;
  // prettier-ignore
  const silverPercent = clamp((count-bronzePracticeCount) / (silverPracticeCount-bronzePracticeCount),0,1)*100;
  // prettier-ignore
  const goldPercent = clamp((count-silverPracticeCount) / (goldPracticeCount-silverPracticeCount),0,1)*100;
  return (
    <div className="flex w-full flex-col gap-[.5px]">
      <div className="flex w-full items-center gap-2">
        <div className="flex h-2 flex-grow gap-0.5 border-2 border-black bg-black">
          <SubProgress
            className="bg-white"
            basis={bronzePracticeCount}
            subPercent={bronzePercent}
          />
          <SubProgress
            className="bg-amber-600"
            basis={silverPracticeCount}
            subPercent={silverPercent}
          />
          <SubProgress
            className="bg-slate-400"
            basis={goldPracticeCount}
            subPercent={goldPercent}
          />
        </div>
        <div className="h-10 w-10 rounded-full border-2 border-black bg-yellow-300" />
      </div>
    </div>
  );
}
