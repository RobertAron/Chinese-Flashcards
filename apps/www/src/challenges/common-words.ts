import { commonWords } from "common-data/common-words";
import { ChallengeDefinition } from "common-data/types";
import { groupByFive } from "./util";

export const commonWordsChallenges: ChallengeDefinition[] = groupByFive(
  commonWords,
).map(
  (ele, index): ChallengeDefinition => ({
    label: `Common Words Challenge ${index + 1}`,
    words: ele,
  }),
);
