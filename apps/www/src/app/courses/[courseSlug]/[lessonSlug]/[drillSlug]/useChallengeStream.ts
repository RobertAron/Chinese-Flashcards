import { useEffect, useRef, useState } from "react";
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
  // Capture initial state for first shuffle - don't reshuffle mid-session when crossing threshold
  const initialEarlyLearning = useRef(isEarlyLearning);

  useEffect(() => {
    const allChallenges = [...typingChallenges, ...multipleChoiceChallenges, ...sentenceBuildingChallenges];
    setProblemList(
      initialEarlyLearning.current ? groupedShuffle(allChallenges, getChallengeKey) : shuffle(allChallenges),
    );
  }, [typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges]);

  if (problems === null) {
    return { initializing: true } as const;
  }
  function nextProblem() {
    if (problems === null) throw new Error("shouldn't be able to call next problem prior to problems setup.");
    const crossingThreshold = practiceCount === practiceCountColors[0].max - 1;
    // Transitioning from early learning to normal - full shuffle and reset
    if (crossingThreshold) {
      setProblemList(shuffle(problems));
      setProblemIndex(0);
      return;
    }
    const onLastItem = problemIndex === problems.length - 1;
    if (onLastItem) {
      if (isEarlyLearning) {
        setProblemList(semiGroupedShuffle(problems, getChallengeKey));
      } else setProblemList(semiShuffle(problems));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  const problem = problems[problemIndex];
  if (problem === undefined) {
    return { noProblems: true } as const;
  }
  return { problem, nextProblem, initializing: false } as const;
}
