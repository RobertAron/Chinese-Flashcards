"use client";
import type { Ref } from "react";
import { ChallengeWrapper, WordProgress } from "./utils";

type CharacterChallengeProps = {
  character: string;
  pinyin: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function CharacterChallenge({
  character,
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
}: CharacterChallengeProps) {
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <div className="flex h-36 flex-col items-center justify-center">
        <div className="text-center text-7xl">{character}</div>
      </div>
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
