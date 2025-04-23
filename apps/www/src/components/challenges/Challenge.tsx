import { match } from "ts-pattern";
import { AudioChallenge } from "./AudioChallenge";
import type { AllTypingChallenges } from "./ChallengeTypes";
import { DefinitionChallenge } from "./DefinitionChallenge";
import { CharacterChallenge } from "./PinyinChallenge";

export function Challenge({
  challenge,
  onProblemComplete,
  active,
  practice,
}: {
  challenge: AllTypingChallenges;
  onProblemComplete: () => void;
  active?: boolean;
  practice?: boolean;
}) {
  return match(challenge)
    .with({ type: "typing-character-challenge" }, (problem) => (
      <CharacterChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        id={problem.id}
        active={active}
        practice={practice}
      />
    ))
    .with({ type: "typing-audio-challenge" }, (problem) => (
      <AudioChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        id={problem.id}
        active={active}
        practice={practice}
      />
    ))
    .with({ type: "typing-definition-challenge" }, (problem) => (
      <DefinitionChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        id={problem.id}
        active
        practice={practice}
      />
    ))
    .exhaustive();
}
