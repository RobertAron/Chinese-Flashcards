"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { AnimatePresence } from "motion/react";
import { useChallengeStream } from "../useChallengeStream";
import {
  formatPracticeCount,
  usePracticeCount,
} from "../../../../utils/playerStats";
import { useState } from "react";
import { Challenge } from "@/components/challenges/Challenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";

export default AppPage(({}) => {
  const { challengeId } = useChallengeContext();
  const { problem, nextProblem, init } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  const [started, setStarted] = useState(false);
  if (problem === undefined) {
    init();
    return null;
  }
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
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div>{practiceCount}</div>
      <AnimatePresence mode="popLayout">
        <Challenge
          onProblemComplete={onProblemComplete}
          challenge={problem}
          active
          practice
        />
      </AnimatePresence>
    </div>
  );
});
