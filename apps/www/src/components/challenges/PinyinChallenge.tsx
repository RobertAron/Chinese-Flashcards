"use client";
import type { Ref } from "react";
import { WordProgress } from "./WordProgress";
import { ChallengeWrapper } from "./ChallengeWrapper";

type CharacterChallengeProps = {
  characters: string;
  pinyin: string;
  id: string;
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
  id,
  ref,
}: CharacterChallengeProps) {
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <div className="flex min-h-36 flex-col items-center justify-center">
        <div className="text-center text-7xl">{characters}</div>
      </div>
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
