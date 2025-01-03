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

type PinyinChallenge = {
  type: "pinyin-challenge";
  id: string;
  character: string;
  pinyin: string;
  definition: string;
};

type AudioChallenge = {
  type: "audio-challenge";
  id: string;
  pinyin: string;
  definition: string;
};

type AllChallenges = PinyinChallenge | AudioChallenge;

export const challenges = Object.fromEntries(
  groups.map((group, index): [string, AllChallenges[]] => [
    `challenge-${index + 1}`,
    group.flatMap(({ character, definition, id, pinyin }): AllChallenges[] => [
      {
        type: "pinyin-challenge",
        definition,
        id: `${id}-pinyin`,
        pinyin,
        character,
      },
      { type: "audio-challenge", definition, id: `${id}-audio`, pinyin },
    ]),
  ]),
);
export type ChallengeItems = (typeof challenges)[string];
