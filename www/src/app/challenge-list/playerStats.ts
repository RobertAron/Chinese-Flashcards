import { useLocalStorage } from "@/utils/hooks";

export function usePracticeCount(challengeId: string) {
  return useLocalStorage(`${challengeId}-practice-count`, 0);
}
export function useTimeAttackPB(challengeId: string) {
  return useLocalStorage<number | null>(
    `${challengeId}-best-time-attack-time`,
    null,
  );
}
