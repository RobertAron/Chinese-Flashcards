import { match } from "ts-pattern";
import { AudioChallenge } from "./AudioChallenge";
import type { AllChallenges } from "./ChallengeContext";
import { DefinitionChallenge } from "./DefinitionChallenge";
import { CharacterChallenge } from "./PinyinChallenge";

export function Challenge({
  challenge,
  onProblemComplete,
  active,
  practice,
}: {
  challenge: AllChallenges;
  onProblemComplete: () => void;
  active?: boolean;
  practice?: boolean;
}) {

  return match(challenge)
    .with({ type: "character-challenge" }, (problem) => (
      <CharacterChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        id={problem.id}
        active={active}
        practice={practice}
      />
    ))
    .with({ type: "audio-challenge" }, (problem) => (
      <AudioChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        id={problem.id}
        active={active}
        practice={practice}
      />
    ))
    .with({ type: "definition-challenge" }, (problem) => (
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
