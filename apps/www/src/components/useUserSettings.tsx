"use client";
import { useLocalStorage } from "@/utils/hooks";

export function useUserSettings() {
  return useLocalStorage("user-settings", {
    requireToneInput: false,
    enableCharacterChallenges: true,
  });
}
