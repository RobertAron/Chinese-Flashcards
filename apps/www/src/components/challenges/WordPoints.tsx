import clsx from "clsx";
import { useMemo } from "react";
import type { HskLevel } from "vocab-db/prisma";
import { useWordPracticeCount } from "@/utils/playerState";
import { HskBadge } from "../HskBadge";

export type WordExperienceProps = {
  characters: string;
  pinyin: string;
  id: number;
  meaning: string;
  hskLevel: HskLevel | null;
  className?: string;
};
export function WordExperience({
  characters,
  pinyin,
  id,
  meaning,
  hskLevel,
  className,
}: WordExperienceProps) {
  const practiceCount = useWordPracticeCount(id);
  const classes = useMemo(() => {
    return clsx(
      "relative flex flex-col items-start justify-between gap-2 rounded-md border-2 border-black bg-white p-2 sm:flex-row",
      className,
    );
  }, [className]);
  return (
    <div className={classes}>
      <div className="flex w-full flex-col gap-1">
        <div className="flex justify-between text-4xl">
          <span className="font-bold">{characters}</span>
          <div className="flex flex-col items-end gap-1">
            <span>x{practiceCount}</span>
            {hskLevel && <HskBadge hskLevel={hskLevel} />}
          </div>
        </div>
        <div>{pinyin}</div>
        <div className="min-h-8">{meaning}</div>
      </div>
    </div>
  );
}
