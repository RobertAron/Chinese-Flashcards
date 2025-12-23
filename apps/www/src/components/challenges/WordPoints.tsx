"use client";
import { CuboidIcon } from "lucide-react";
import type { HskLevel } from "vocab-db/prisma";
import { cn } from "@/utils/cn";
import { useWordPracticeCount } from "@/utils/playerState";
import { HskBadge } from "../HskBadge";

export type WordExperienceProps = {
  characters: string;
  pinyin: string;
  id: number;
  meaning: string;
  hskLevel: HskLevel | null;
  className?: string;
  buildingBlockOnly?: boolean;
};
export function WordExperience({
  characters,
  pinyin,
  id,
  meaning,
  hskLevel,
  className,
  buildingBlockOnly,
}: WordExperienceProps) {
  const practiceCount = useWordPracticeCount(id);
  return (
    <div
      className={cn(
        "relative flex flex-col items-start justify-between gap-2 rounded-md border-2 border-black bg-white p-2 sm:flex-row",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex justify-between text-4xl">
          <span className="font-bold">{characters}</span>
          <div className="flex flex-col items-end gap-1">
            <span>x{practiceCount}</span>
            <div className="flex gap-1">
              {hskLevel && <HskBadge hskLevel={hskLevel} />}
              {buildingBlockOnly && (
                <div className="flex h-6 items-center justify-center rounded-full border bg-indigo-50 p-1 text-sm">
                  <CuboidIcon className="h-5 w-5"/>
                  <span>Building Block Only</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>{pinyin}</div>
        <div className="min-h-8">{meaning}</div>
      </div>
    </div>
  );
}
