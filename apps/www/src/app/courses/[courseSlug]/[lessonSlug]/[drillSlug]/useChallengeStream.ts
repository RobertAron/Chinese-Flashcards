import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { semiShuffle } from "@/utils/structureUtils";
import { useEffect, useState } from "react";

export function useChallengeStream() {
  const { challenges } = useChallengeContext();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | typeof challenges>(null);
  useEffect(() => {
    setProblemList(semiShuffle(challenges));
  }, [challenges]);
  const problem = problems?.[problemIndex];
  if (problem === undefined) {
    return { initializing: true } as const;
  }
  function nextProblem() {
    const onLastItem = problemIndex === problems!.length - 1;
    if (onLastItem) {
      setProblemList(semiShuffle(problems!));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  return { problem, nextProblem, initializing: false } as const;
}
