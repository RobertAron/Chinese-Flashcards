import { useLocalStorage } from "@/utils/hooks";

export function usePracticeCount(challengeId: string) {
  return useLocalStorage(`${challengeId}-practice-count`, 0);
}
export function useTimeAttackPB(challengeId: string) {
  return useLocalStorage<number | null>(`${challengeId}-best-time-attack-time`, null);
}

export type AwardTypes = "bronze" | "silver" | "gold" | null;

export const timeForGold = 25 * 1000;
export const timeForSilver = 50 * 1000;
export const timeForBronze = 75 * 1000;
export function timeAttackToAward(ms: number | null): AwardTypes {
  if (ms === null) return null;
  if (ms < timeForGold) return "gold";
  if (ms < timeForSilver) return "silver";
  if (ms < timeForBronze) return "bronze";
  return null;
}
export function formatTimeAttackMs(ms: number | null) {
  if (ms === null) return "NOT COMPLETED";
  return `${(ms / 1000).toFixed(2)}s`;
}

export const bronzePracticeCount = 100;
export const silverPracticeCount = 150;
export const goldPracticeCount = 250;
export const totalTillBronze = bronzePracticeCount;
export const totalTillSilver = bronzePracticeCount + silverPracticeCount;
export const totalTillGold = bronzePracticeCount + silverPracticeCount + goldPracticeCount;

export function practiceCountToAward(count: number | null): AwardTypes {
  if (count === null) return null;
  if (count > totalTillGold) return "gold";
  if (count > totalTillSilver) return "silver";
  if (count > totalTillBronze) return "bronze";
  return null;
}

export function formatPracticeCount(count: number | null) {
  if (count === 0) return "NOT STARTED";
  return `x${count}`;
}
