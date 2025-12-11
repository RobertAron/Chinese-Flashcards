"use client";
import clsx from "clsx";
import { WordExperience, type WordExperienceProps } from "@/components/challenges/WordPoints";
import { practiceCountToColor } from "@/utils/colorMapping";
import { useWordPracticeCount } from "@/utils/playerState";

export function ConditionalWord(props: WordExperienceProps) {
  return <WordExperience {...props} />;
}

export function ExperienceBox({ wordId }: { wordId: number }) {
  const practiceCount = useWordPracticeCount(wordId);
  const color = practiceCountToColor(practiceCount)?.background;
  return (
    <div
      className={clsx("aspect-square h-full w-full rounded-sm border-2 border-black", color)}
      style={{ background: color }}
    />
  );
}
