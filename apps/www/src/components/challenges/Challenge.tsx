import { match, P } from "ts-pattern";
import { AudioChallenge } from "./AudioChallenge";
import type { AllChallengeTypes } from "./ChallengeTypes";
import { DefinitionChallenge } from "./DefinitionChallenge";
import { CharacterChallenge } from "./PinyinChallenge";
import { MultipleChoiceChallenge } from "./MultipleChoiceQuestionChallenge";

export function Challenge({
  challenge,
  onProblemComplete,
  active,
  practice,
}: {
  challenge: AllChallengeTypes;
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
    .with(
      {
        type: P.union("multiple-choice-question-character-audio", "multiple-choice-question-character-text"),
      },
      (problem) => <MultipleChoiceChallenge onComplete={onProblemComplete} thing={problem} />,
    )
    .exhaustive();
}
