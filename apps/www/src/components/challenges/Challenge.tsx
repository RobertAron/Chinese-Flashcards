import type{ Ref } from "react";
import { P, match } from "ts-pattern";
import { AudioChallenge } from "./AudioChallenge";
import type { AllChallengeTypes } from "./ChallengeTypes";
import { DefinitionChallenge } from "./DefinitionChallenge";
import { MultipleChoiceChallenge } from "./MultipleChoiceQuestionChallenge";
import { CharacterChallenge } from "./PinyinChallenge";

export function Challenge({
  challenge,
  onProblemComplete,
  active,
  practice,
  ref,
}: {
  challenge: AllChallengeTypes;
  onProblemComplete: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return match(challenge)
    .with({ type: "typing-character-challenge" }, (problem) => (
      <CharacterChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        active={active}
        practice={practice}
        ref={ref}
      />
    ))
    .with({ type: "typing-audio-challenge" }, (problem) => (
      <AudioChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        active={active}
        practice={practice}
        ref={ref}
      />
    ))
    .with({ type: "typing-definition-challenge" }, (problem) => (
      <DefinitionChallenge
        {...problem}
        onComplete={onProblemComplete}
        key={problem.id}
        active
        practice={practice}
        ref={ref}
      />
    ))
    .with(
      {
        type: P.union("multiple-choice-question-character-audio", "multiple-choice-question-character-text"),
      },
      (problem) => (
        <MultipleChoiceChallenge
          ref={ref}
          onComplete={onProblemComplete}
          problem={problem}
          key={problem.id}
        />
      ),
    )
    .exhaustive();
}
