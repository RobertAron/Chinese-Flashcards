import { data } from "@/data/top1000";
import { ChallengeDefinition, WordDefinition } from "./types";

function groupByFive<T>(arr: T[]): T[][] {
  const grouped: T[][] = [];
  for (let i = 0; i < arr.length; i += 5) {
    grouped.push(arr.slice(i, i + 5));
  }
  return grouped;
}

const groups = groupByFive(
  data.map((ele, index) => ({ ...ele, id: `top-1000-${index}` })),
);

export const mostCommonWordChallenges = Object.fromEntries(
  groups.map((group, index): [string, ChallengeDefinition] => [
    `challenge-${index + 1}`,
    {
      label: `Most Common Words: ${index * 5 + 1}-${(index + 1) * 5}`,
      words: group.flatMap(
        ({ character, definition, id, pinyin }): WordDefinition[] => [
          {
            definition,
            id: id,
            pinyin,
            character,
            fileName: `${pinyin}.mp3`,
          },
        ],
      ),
    },
  ]),
);
