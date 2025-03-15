export function WordExperience({
  characters,
  pinyin,
}: {
  characters: string;
  pinyin: string;
  id: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border-2 border-black bg-white p-2">
      <div className="font-bold text-2xl">{characters}</div>
      <div>{pinyin}</div>
    </div>
  );
}
