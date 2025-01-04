import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { semiShuffle } from "@/utils/structureUtils";
import { useState } from "react";

export function useChallengeStream() {
  const { challenges } = useChallengeContext();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | typeof challenges>(null);
  if (problems === null) {
    return { init: () => setProblemList(semiShuffle(challenges)) };
  }
  const problem = problems[problemIndex];
  if (problem === undefined) throw new Error("Item Missing");
  function nextProblem() {
    const onLastItem = problemIndex === problems!.length - 1;
    if (onLastItem) {
      setProblemList(semiShuffle(problems!));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  return { problem, nextProblem };
}
