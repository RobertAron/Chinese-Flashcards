import { useTypingChallenge } from "@/components/challenges/TypingChallengeProvider";
import { semiShuffle, shuffle } from "@/utils/structureUtils";
import { useEffect, useState } from "react";

export function useChallengeStream() {
  const { challenges } = useTypingChallenge();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | typeof challenges>(null);
  useEffect(() => {
    setProblemList(shuffle(challenges));
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
