"use client";
import type { Ref } from "react";
import { ChallengeWrapper } from "./ChallengeWrapper";
import { WordProgress } from "./WordProgress";

type CharacterChallengeProps = {
  characters: string;
  pinyin: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function CharacterChallenge({
  characters,
  pinyin,
  onComplete,
  active,
  practice,
  ref,
}: CharacterChallengeProps) {
  return (
    <ChallengeWrapper active={active} ref={ref}>
      <div className="flex min-h-36 flex-col items-center justify-center">
        <div className="text-center text-7xl">{characters}</div>
      </div>
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
