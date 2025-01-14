import { data } from "common-data/top1000";
import type { ChallengeDefinition, WordDefinition } from "common-data/types";
import { groupByFive } from "./util";

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
