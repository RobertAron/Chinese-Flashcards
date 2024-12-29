import { useChallengeContext } from "@/components/ChallengeContext";
import { semiShuffle } from "@/utils/structureUtils";
import { useState } from "react";

export function useChallengeStream() {
  const { challengeItems: challenge } = useChallengeContext();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState(() => semiShuffle(challenge));
  const problem = problems[problemIndex];
  if (problem === undefined) throw new Error("Item Missing");
  function nextProblem() {
    console.log(problemIndex);
    const onLastItem = problemIndex === problems.length - 1;
    if (onLastItem) {
      setProblemList(semiShuffle(problems));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  return { problem, nextProblem };
}
