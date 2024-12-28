import { useState } from "react";
import { semiShuffle } from "./structureUtils";
import { challenges } from "@/challenges/top100";

type ValueOf<T> = T[keyof T];
export function useChallengeStream(challenge: ValueOf<typeof challenges>) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState(() => semiShuffle(challenge));
  const problem = problems[problemIndex];
  if (problem === undefined) throw new Error("Item Missing");
  function nextProblem() {
    console.log(problemIndex)
    const onLastItem = problemIndex === problems.length - 1;
    if (onLastItem) {
      setProblemList(semiShuffle(problems));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  return { problem, nextProblem };
}
