import { data } from "@/data/top1000";

function groupByFive<T>(arr: T[]): T[][] {
  const grouped: T[][] = [];
  for (let i = 0; i < arr.length; i += 5) {
    grouped.push(arr.slice(i, i + 5));
  }
  return grouped;
}

const groups = groupByFive(
  data.map((ele, index) => ({ ...ele, id: `${index}` })),
);

export type WordDefinition = {
  id: string;
  character: string;
  pinyin: string;
  definition: string;
};

export const wordDefinitions = Object.fromEntries(
  groups.map((group, index): [string, WordDefinition[]] => [
    `challenge-${index + 1}`,
    group.flatMap(({ character, definition, id, pinyin }): WordDefinition[] => [
      {
        definition,
        id: `${id}`,
        pinyin,
        character,
      },
    ]),
  ]),
);
