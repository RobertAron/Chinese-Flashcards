import type { HskLevel } from "cms-data/drizzle/schema";
import { useWordPracticeCount } from "@/utils/playerState";
import { HskBadge } from "../HskBadge";

export function WordExperience({
  characters,
  pinyin,
  id,
  meaning,
  hskLevel,
}: {
  characters: string;
  pinyin: string;
  id: number;
  meaning: string;
  hskLevel: HskLevel | null;
}) {
  const practiceCount = useWordPracticeCount(id);
  return (
    <div className="flex flex-col items-start justify-between p-2 bg-white border-2 border-black gap-2 rounded-md sm:flex-row">
      <div className="flex flex-col w-full gap-1">
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
