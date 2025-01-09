"use client";
import { Ref } from "react";
import { ChallengeWrapper, WordProgress } from "./utils";

type DefinitionChallengeProps = {
  pinyin: string;
  definition: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  display?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function DefinitionChallenge({
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
  display,
  definition,
}: DefinitionChallengeProps) {
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <div className="flex h-36 items-center justify-center">
        <div className="text-center text-2xl">{definition}</div>
      </div>
      <WordProgress
        pinyin={pinyin}
        active={active}
        display={display}
        practice={practice}
        onComplete={onComplete}
      />
    </ChallengeWrapper>
  );
}
