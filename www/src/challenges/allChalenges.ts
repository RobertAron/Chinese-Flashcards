import { manualChallenges } from "./manual";
import { mostCommonWordChallenges } from "./top1000";

export const allChallenges = {
  ...manualChallenges,
  ...mostCommonWordChallenges,
};
