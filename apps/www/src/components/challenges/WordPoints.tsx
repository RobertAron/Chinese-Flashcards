import { useWordPracticeCount } from "@/utils/playerState";

export function WordExperience({
  characters,
  pinyin,
  id,
  meaning,
}: {
  characters: string;
  pinyin: string;
  id: number;
  meaning: string;
}) {
  const practiceCount = useWordPracticeCount(id);
  return (
    <div className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-black bg-white p-2 md:flex-row">
      <div className="flex flex-col gap-1">
        <div className="font-bold text-3xl">{characters}</div>
        <div>{pinyin}</div>
        <div>{meaning}</div>
      </div>
      <div className="text-4xl">x{practiceCount}</div>
    </div>
  );
}
