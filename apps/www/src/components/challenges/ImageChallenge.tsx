"use client";
import type { Ref } from "react";
import { ChallengeWrapper } from "./ChallengeWrapper";
import { WordProgress } from "./WordProgress";

type ImageChallengeProps = {
  pinyin: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  imageSrc: string;
  definition: string;
  ref?: Ref<HTMLDivElement>;
};

export function ImageChallenge({
  pinyin,
  onComplete,
  active,
  practice,
  ref,
  imageSrc,
  definition,
}: ImageChallengeProps) {
  return (
    <ChallengeWrapper ref={ref}>
      <img width={200} height={200} src={imageSrc} aria-label={definition} className="rounded-sm" />
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
