import type { Ref } from "react";
import { P, match } from "ts-pattern";
import { AudioChallenge } from "./AudioChallenge";
import type { AllChallengeTypes } from "./ChallengeTypes";
import { DefinitionChallenge } from "./DefinitionChallenge";
import { MultipleChoiceChallenge } from "./MultipleChoiceQuestionChallenge";
import { CharacterChallenge } from "./PinyinChallenge";

export function Challenge({
  challenge,
  onComplete,
  active,
  practice,
  ref,
}: {
  challenge: AllChallengeTypes;
  onComplete: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return match(challenge)
    .with({ type: "typing-character-challenge" }, (challenge) => (
      <CharacterChallenge
        {...challenge}
        onComplete={onComplete}
        key={challenge.id}
        active={active}
        practice={practice}
        ref={ref}
      />
    ))
    .with({ type: "typing-audio-challenge" }, (challenge) => (
      <AudioChallenge
        {...challenge}
        onComplete={onComplete}
        key={challenge.id}
        active={active}
        practice={practice}
        ref={ref}
      />
    ))
    .with({ type: "typing-definition-challenge" }, (challenge) => (
      <DefinitionChallenge
        {...challenge}
        onComplete={onComplete}
        key={challenge.id}
        active
        practice={practice}
        ref={ref}
      />
    ))
    .with(
      {
        type: P.union("multiple-choice-question-character-audio", "multiple-choice-question-character-text"),
      },
      (challenge) => (
        <MultipleChoiceChallenge ref={ref} onComplete={onComplete} challenge={challenge} key={challenge.id} />
      ),
    )
    .exhaustive();
}
