"use client";
import { AppPage } from "@/components/AppPage";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { useChallenge } from "@/utils/useChallenge";
import { useChallengeStream } from "@/utils/useChallengeStream";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AnimatePresence } from "motion/react";

export default AppPage(({}) => {
  const challenge = useChallenge();
  if (challenge === null) throw new Error("Not found challenge");
  const { problem, nextProblem } = useChallengeStream(challenge.content);
  const [practiceCount, setPracticeCount] = useLocalStorage(
    `${challenge.challengeId}-practice-count`,
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
