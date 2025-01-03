"use client";
import { Ref } from "react";
import { ChallengeWrapper, useTypeMatchProgress, WordProgress } from "./utils";

type PinyinChallengeProps = {
  character: string;
  pinyin: string;
  definition: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  display?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function PinyinChallenge({
  character,
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
  definition,
  display,
}: PinyinChallengeProps) {
  const progress = useTypeMatchProgress(pinyin, active, onComplete);
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <div className="text-center text-4xl">{character}</div>
      <div className="text-pretty text-center text-sm">{definition}</div>
      <WordProgress
        progress={progress}
        pinyin={pinyin}
        active={active}
        display={display}
        practice={practice}
      />
    </ChallengeWrapper>
  );
}
