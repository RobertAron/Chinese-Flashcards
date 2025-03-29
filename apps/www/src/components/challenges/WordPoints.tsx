import { useWordPracticeCount } from "@/utils/playerState";

export function WordExperience({
  characters,
  pinyin,
  id,
}: {
  characters: string;
  pinyin: string;
  id: number;
}) {
  const practiceCount = useWordPracticeCount(id);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border-2 border-black bg-white p-2">
      <div className="flex flex-col gap-1">
        <div className="font-bold text-3xl">{characters}</div>
        <div>{pinyin}</div>
      </div>
      <div className="text-4xl">x{practiceCount}</div>
    </div>
  );
}
