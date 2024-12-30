"use client";
import { AppPage } from "@/components/AppPage";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { AnimatePresence } from "motion/react";
import { useChallengeStream } from "../useChallengeStream";
import { useChallengeContext } from "@/components/ChallengeContext";
import { useLocalStorage } from "@/utils/hooks";

export default AppPage(({}) => {
  const { challengeId } = useChallengeContext();
  const { problem, nextProblem } = useChallengeStream();
  const [practiceCount, setPracticeCount] = useLocalStorage(
    `${challengeId}-practice-count`,
    0,
  );
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
