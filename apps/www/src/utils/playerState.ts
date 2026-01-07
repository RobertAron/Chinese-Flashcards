"use client";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useStore } from "zustand";
import { practiceCountColors as pcc } from "./colorMapping";
import { createZustandContext } from "./createZustandContext";

const playerStateTemplate = z.object({
  wordPracticeCounts: z.record(z.string(), z.number().optional()),
  challengePracticeCounts: z.record(z.string(), z.number().optional()),
  challengeTimeAttackPB: z.record(z.string(), z.number().optional()),
  settings: z.object({
    requireToneInput: z.boolean(),
    enableCharacterChallenges: z.boolean(),
    enableMultipleChoiceChallenges: z.boolean().default(false),
    enableTypingChallenges: z.boolean().default(true),
    enableSentenceBuildingChallenges: z.boolean().default(true),
  }),
});

type PlayerState = z.infer<typeof playerStateTemplate>;
const { Provider: PlayerProvider, useContext: usePlayerContextStore } = createZustandContext<PlayerState>({
  challengePracticeCounts: {},
  challengeTimeAttackPB: {},
  wordPracticeCounts: {},
  settings: {
    requireToneInput: false,
    enableCharacterChallenges: true,
    enableMultipleChoiceChallenges: false,
    enableTypingChallenges: true,
    enableSentenceBuildingChallenges: true,
  },
});
// Webpack bug, cannot rename and export in same line.
export { PlayerProvider, usePlayerContextStore };

const server = typeof window === "undefined";
export function SyncPlayerStateToLocalStorage() {
  const playerState = useFullPlayerState();
  const [isLoaded, setIsLoaded] = useState(false);

  const store = usePlayerContextStore();
  const updater = useStore(store, (s) => s.update);
  // after first load, sync the state
  if (!server && isLoaded) {
    window.localStorage.setItem("playerState", JSON.stringify(playerState));
  }
  useEffect(() => {
    // on first load, setup the state
    if (!isLoaded) {
      setIsLoaded(true);
      try {
        const previousState = window.localStorage.getItem("playerState");
        if (previousState !== null) updater(playerStateTemplate.parse(JSON.parse(previousState)));
      } catch (err) {
        console.log("Failed to load player state", err);
      }
    }
  }, [updater, isLoaded]);
  return null;
}

export function useFullPlayerState() {
  const store = usePlayerContextStore();
  return useStore(store);
}

export function usePracticeCount(challengeId: string) {
  const store = usePlayerContextStore();
  const count = useStore(store, (s) => s.challengePracticeCounts[challengeId] ?? 0);
  const updater = useStore(store, (s) => s.update);
  const setCount = useCallback(
    (value: number) => {
      updater((s) => ({
        ...s,
        challengePracticeCounts: {
          ...s.challengePracticeCounts,
          [challengeId]: value,
        },
      }));
    },
    [challengeId, updater],
  );
  return [count, setCount] as const;
}

export function useTimeAttackPB(challengeId: string) {
  const store = usePlayerContextStore();
  const pb = useStore(store, (s) => s.challengeTimeAttackPB[challengeId] ?? null);
  const updater = useStore(store, (s) => s.update);
  const trySetPB = useCallback(
    (value: number | null) => {
      if (value === null) return;
      updater((s) => {
        const currentPB = s.challengeTimeAttackPB[challengeId];
        return {
          ...s,
          challengeTimeAttackPB: {
            ...s.challengeTimeAttackPB,
            [challengeId]: currentPB === undefined ? value : Math.min(value, currentPB),
          },
        };
      });
    },
    [challengeId, updater],
  );
  return [pb, trySetPB] as const;
}

export function useUserSettings() {
  const store = usePlayerContextStore();
  const userSettings = useStore(store, (s) => s.settings);
  const updater = useStore(store, (s) => s.update);
  const setUserSettings = useCallback(
    (settings: PlayerState["settings"]) => {
      updater((s) => ({
        ...s,
        settings,
      }));
    },
    [updater],
  );
  return [userSettings, setUserSettings] as const;
}
export type UserSettings = ReturnType<typeof useUserSettings>[0];

export function useWordPracticeCount(wordId: number) {
  const store = usePlayerContextStore();
  return useStore(store, (s) => s.wordPracticeCounts[wordId] ?? 0);
}

export function useWordIncrementor() {
  const store = usePlayerContextStore();
  const updater = useStore(store, (s) => s.update);
  return useCallback(
    (wordIds: number[]) => {
      updater((current) => {
        const newVals = Object.fromEntries(
          wordIds.map((ele) => [ele, (current.wordPracticeCounts[ele] ?? 0) + 1]),
        );
        return {
          ...current,
          wordPracticeCounts: {
            ...current.wordPracticeCounts,
            ...newVals,
          },
        };
      });
    },
    [updater],
  );
}

export function formatTimeAttackMs(ms: number | null) {
  if (ms === null) return "NOT COMPLETED";
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatPracticeCount(count: number | null) {
  if (count === 0) return "NOT STARTED";
  return `x${count}`;
}

export function practiceCountTillNextValues(c: number | null) {
  if (c === null || c < pcc[0].max) return { current: c ?? 0, requiredForNext: pcc[0].max };
  if (c < pcc[1].max) return { current: c - pcc[1].min, requiredForNext: pcc[1].max - pcc[1].min };
  if (c < pcc[2].max) return { current: c - pcc[2].min, requiredForNext: pcc[2].max - pcc[2].min };
  if (c < pcc[3].max) return { current: c - pcc[3].min, requiredForNext: pcc[3].max - pcc[3].min };
  return { current: c, requiredForNext: null };
}
