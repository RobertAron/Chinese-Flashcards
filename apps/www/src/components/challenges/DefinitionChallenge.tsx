"use client";
import type { Ref } from "react";
import { ChallengeWrapper } from "./ChallengeWrapper";
import { WordProgress } from "./WordProgress";

type DefinitionChallengeProps = {
  pinyin: string;
  definition: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function DefinitionChallenge({
  pinyin,
  onComplete,
  active,
  practice,
  ref,
  definition,
}: DefinitionChallengeProps) {
  return (
    <ChallengeWrapper ref={ref}>
      <div className="flex items-center justify-center min-h-36">
        <div className="text-3xl text-center">{definition}</div>
      </div>
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
