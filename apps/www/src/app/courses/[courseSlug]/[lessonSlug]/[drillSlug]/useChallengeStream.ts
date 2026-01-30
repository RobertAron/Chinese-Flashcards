import { useEffect, useState } from "react";
import type { AllChallengeTypes } from "@/components/challenges/ChallengeTypes";
import { useTypingChallenge } from "@/components/challenges/TypingChallengeProvider";
import { groupedShuffle, semiGroupedShuffle, semiShuffle, shuffle } from "@/utils/structureUtils";

function getChallengeKey(challenge: AllChallengeTypes): string {
  return challenge.wordIds.join(",");
}

export function useChallengeStream(beginnerMode = false) {
  const { typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges } = useTypingChallenge();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | AllChallengeTypes[]>(null);

  useEffect(() => {
    const allChallenges = [...typingChallenges, ...multipleChoiceChallenges, ...sentenceBuildingChallenges];
    setProblemList(beginnerMode ? groupedShuffle(allChallenges, getChallengeKey) : shuffle(allChallenges));
  }, [typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges, beginnerMode]);

  if (problems === null) {
    return { initializing: true } as const;
  }
  const problem = problems[problemIndex];
  if (problem === undefined) {
    return { noProblems: true } as const;
  }

  function nextProblem() {
    if (problems === null) throw new Error("shouldn't be able to call next problem prior to problems setup.");
    const onLastItem = problemIndex === problems.length - 1;
    // normal case move to next item
    if (!onLastItem) setProblemIndex(problemIndex + 1);
    else {
      // shuffle items around
      setProblemIndex(0);
      if (beginnerMode) setProblemList(semiGroupedShuffle(problems, getChallengeKey));
      else setProblemList(semiShuffle(problems, problem));
    }
  }
  return { problem, nextProblem, initializing: false } as const;
}
