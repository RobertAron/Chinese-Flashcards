import { useEffect, useState } from "react";
import type { AllChallengeTypes } from "@/components/challenges/ChallengeTypes";
import { useTypingChallenge } from "@/components/challenges/TypingChallengeProvider";
import { practiceCountColors } from "@/utils/colorMapping";
import { groupedShuffle, semiGroupedShuffle, semiShuffle, shuffle } from "@/utils/structureUtils";

function getChallengeKey(challenge: AllChallengeTypes): string {
  return challenge.wordIds.join(",");
}

export function useChallengeStream(practiceCount?: number) {
  const { typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges } = useTypingChallenge();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblemList] = useState<null | AllChallengeTypes[]>(null);
  const isEarlyLearning = practiceCount !== undefined && practiceCount < practiceCountColors[0].max;

  useEffect(() => {
    const allChallenges = [...typingChallenges, ...multipleChoiceChallenges, ...sentenceBuildingChallenges];
    setProblemList(
      isEarlyLearning ? groupedShuffle(allChallenges, getChallengeKey) : shuffle(allChallenges),
    );
  }, [typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges, isEarlyLearning]);

  if (problems === null) {
    return { initializing: true } as const;
  }
  function nextProblem() {
    if (problems === null) throw new Error("shouldn't be able to call next problem prior to problems setup.");
    const crossingThreshold = practiceCount === practiceCountColors[0].max - 1;
    // Transitioning from early learning to normal - full shuffle and reset
    if (crossingThreshold) {
      setProblemList(semiShuffle(problems));
      setProblemIndex(0);
      return;
    }
    const onLastItem = problemIndex === problems.length - 1;
    // normal case move to next item
    if (!onLastItem) setProblemIndex(problemIndex + 1);
    else {
      // shuffle items around
      setProblemIndex(0);
      if (isEarlyLearning) setProblemList(semiGroupedShuffle(problems, getChallengeKey));
      else setProblemList(semiShuffle(problems));
    }
  }
  const problem = problems[problemIndex];
  if (problem === undefined) {
    return { noProblems: true } as const;
  }
  return { problem, nextProblem, initializing: false } as const;
}
