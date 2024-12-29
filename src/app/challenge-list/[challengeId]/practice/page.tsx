"use client";
import { AppPage } from "@/components/AppPage";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AnimatePresence } from "motion/react";
import { useChallengeStream } from "../useChallangeStream";
import { useChallengeContext } from "@/components/ChallengeContext";

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
