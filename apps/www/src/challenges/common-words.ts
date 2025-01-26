import { commonWords } from "common-data/common-words";
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
