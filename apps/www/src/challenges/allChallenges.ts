import { manualChallenges } from "common-data/manual";
import { commonWordsChallenges } from "./common-words";
import { mostCommonWordChallenges } from "./top1000";
export const allChallenges = {
  ...commonWordsChallenges,
  ...manualChallenges,
  ...mostCommonWordChallenges,
};
