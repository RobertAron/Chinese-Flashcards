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

export function formatPracticeCount(count: number) {
  // prettier-ignore
  const medal = match(count)
    .when((count) => count > 500, () => "🥇")
    .when((count) => count > 250, () => "🥈")
    .when((count) => count > 100, () => "🥉")
    .otherwise(() => "");
  return `${medal} x${count}`;
}
