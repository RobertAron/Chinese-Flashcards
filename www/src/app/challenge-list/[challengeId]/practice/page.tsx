"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/ChallengeContext";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { AnimatePresence } from "motion/react";
import { useChallengeStream } from "../useChallengeStream";
import { usePracticeCount } from "../../playerStats";

export default AppPage(({}) => {
  const { challengeId } = useChallengeContext();
  const { problem, nextProblem, init } = useChallengeStream();
  const [practiceCount, setPracticeCount] = usePracticeCount(challengeId);
  if (problem === undefined) {
    init();
    return null;
  }
  return (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div>{practiceCount}</div>
      <AnimatePresence mode="popLayout">
        <PinyinChallenge
          {...problem}
          onComplete={() => {
            setPracticeCount(practiceCount + 1);
            nextProblem();
          }}
          key={problem.id}
          id={`${problem.id}`}
          active
          practice
        />
      </AnimatePresence>
    </div>
  );
});
