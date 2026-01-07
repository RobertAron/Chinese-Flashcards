import { useEffect, useState } from "react";
import type { AllChallengeTypes } from "@/components/challenges/ChallengeTypes";
import { useTypingChallenge } from "@/components/challenges/TypingChallengeProvider";
import { semiShuffle, shuffle } from "@/utils/structureUtils";

export function useChallengeStream() {
  const { typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges } = useTypingChallenge();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | AllChallengeTypes[]>(null);
  useEffect(() => {
    setProblemList(shuffle([...typingChallenges, ...multipleChoiceChallenges, ...sentenceBuildingChallenges]));
  }, [typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges]);
  if (problems === null) {
    return { initializing: true } as const;
  }
  function nextProblem() {
    const onLastItem = problemIndex === problems!.length - 1;
    if (problems === null) throw new Error("shouldn't be able to call next problem prior to problems setup.");
    if (onLastItem) {
      setProblemList(semiShuffle(problems));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  const problem = problems[problemIndex];
  if (problem === undefined) {
    return { noProblems: true } as const;
  }
  return { problem, nextProblem, initializing: false } as const;
}
