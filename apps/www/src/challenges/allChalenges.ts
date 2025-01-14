import { manualChallenges } from "common-data/manual";
import { mostCommonWordChallenges } from "./top1000";
import { commonWordsChallenges } from "./common-words";
export const allChallenges = {
  ...commonWordsChallenges,
  ...manualChallenges,
  ...mostCommonWordChallenges,
};
