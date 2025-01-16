import { WordDefinition } from "common-data/types";

type WordOutlineProps = {
  word: WordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { character, definition, pinyin } = word;
  return (
    <div className="flex w-64 flex-col items-center gap-2 rounded-md border-2 border-black bg-white p-2">
      <div className="text-center text-4xl">{character}</div>
      <div className="text-2xl font-semibold">{pinyin}</div>
      <div className="text-pretty text-center text-sm">{definition}</div>
    </div>
  );
}
