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
export function formatTimeAttackMs(ms: number) {
  // prettier-ignore
  const medal = match(ms)
    .when((ms) => ms < 20 * 1000, () => "🥇")
    .when((ms) => ms < 30 * 1000, () => "🥈")
    .when((ms) => ms < 40 * 1000, () => "🥉")
    .otherwise(() => "");
  return `${medal}${(ms / 1000).toFixed(2)}s`;
}

export const bronzePracticeCount = 100;
export const silverPracticeCount = 250;
export const goldPracticeCount = 500;

export function formatPracticeCount(count: number) {
  // prettier-ignore
  const medal = match(count)
    .when((count) => count > goldPracticeCount, () => "🥇")
    .when((count) => count > silverPracticeCount, () => "🥈")
    .when((count) => count > bronzePracticeCount, () => "🥉")
    .otherwise(() => "");
  return `${medal} x${count}`;
}
