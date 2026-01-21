"use client";
import clsx from "clsx";
import { practiceCountToColor } from "@/utils/colorMapping";
import { useWordPracticeCount } from "@/utils/playerState";

export function ExperienceBox({ wordId }: { wordId: number }) {
  const practiceCount = useWordPracticeCount(wordId);
  const color = practiceCountToColor(practiceCount)?.background ?? "bg-white";
  return (
    <div
      className={clsx("aspect-square h-full w-full rounded-sm border-2 border-black", color)}
      style={{ background: color }}
    />
  );
}
