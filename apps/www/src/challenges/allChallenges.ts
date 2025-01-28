import { manualChallenges } from "common-data/manual";
import { commonWordsChallenges, ishaWordsChallenges } from "./common-words";
import { mostCommonWordChallenges } from "./top1000";
export const allChallenges = {
  ...ishaWordsChallenges,
  ...commonWordsChallenges,
  ...manualChallenges,
  ...mostCommonWordChallenges,
};
