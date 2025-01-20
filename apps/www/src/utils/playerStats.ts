import { useLocalStorage } from "@/utils/hooks";
import { match } from "ts-pattern";

export function usePracticeCount(challengeId: string) {
  return useLocalStorage(`${challengeId}-practice-count`, 0);
}
export function useTimeAttackPB(challengeId: string) {
  return useLocalStorage<number | null>(
    `${challengeId}-best-time-attack-time`,
    null,
  );
}
export function formatTimeAttackMs(ms: number | null) {
  if (ms === null) return "NOT COMPLETED";
  // prettier-ignore
  const medal = match(ms)
    .when((ms) => ms < 25 * 1000, () => "🥇")
    .when((ms) => ms < 50 * 1000, () => "🥈")
    .when((ms) => ms < 75 * 1000, () => "🥉")
    .otherwise(() => "");
  return `PB ${medal}${(ms / 1000).toFixed(2)}s`;
}

export const bronzePracticeCount = 100;
export const silverPracticeCount = 150;
export const goldPracticeCount = 250;
export const totalTillBronze = bronzePracticeCount;
export const totalTillSilver = bronzePracticeCount + silverPracticeCount;
export const totalTillGold =
  bronzePracticeCount + silverPracticeCount + goldPracticeCount;

export function formatPracticeCount(count: number) {
  // prettier-ignore
  const medal = match(count)
    .when((count) => count > totalTillGold, () => "🥇")
    .when((count) => count > totalTillSilver, () => "🥈")
    .when((count) => count > totalTillBronze, () => "🥉")
    .otherwise(() => "");
  return `${medal} x${count}`;
}
