import { commonWords } from "common-data/common-words";
import { ishaWords } from "common-data/ishas";
import type { ChallengeDefinition } from "common-data/types";
import { groupByFive } from "./util";

export const commonWordsChallenges: Record<string, ChallengeDefinition> = Object.fromEntries(
  groupByFive(commonWords).map((ele, index): [string, ChallengeDefinition] => [
    `common-word-challenge-${index + 1}`,
    {
      label: `Common Words Challenge ${index + 1}`,
      words: ele,
    },
  ]),
);

export const ishaWordsChallenges: Record<string, ChallengeDefinition> = Object.fromEntries(
  groupByFive(ishaWords).map((ele, index): [string, ChallengeDefinition] => [
    `isha-word-challenge-${index + 1}`,
    {
      label: `Isha's Song Challenge ${index + 1}`,
      words: ele,
    },
  ]),
);
