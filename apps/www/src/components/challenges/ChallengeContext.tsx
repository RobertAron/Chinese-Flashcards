"use client";
import { useUserSettings } from "@/components/useUserSettings";
import { generateContext } from "@/utils/createContext";
import type { WordDefinition } from "common-data/types";
import type React from "react";
import type { getDrillInfo } from "../../app/courses/[courseSlug]/[lessonSlug]/[drillSlug]/getDrillInfo";

type ProviderProps = {
  children?: React.ReactNode;
  courseSlug: string;
  lessonSlug: string;
  drillSlug: string;
} & Awaited<ReturnType<typeof getDrillInfo>>;
type CharacterChallenge = {
  type: "character-challenge";
  id: string;
  character: string;
  pinyin: string;
};
type AudioChallenge = {
  type: "audio-challenge";
  id: string;
  pinyin: string;
  src: string;
};
type DefinitionChallenge = {
  type: "definition-challenge";
  id: string;
  pinyin: string;
  definition: string;
};
export type AllChallenges = CharacterChallenge | AudioChallenge | DefinitionChallenge;
type ProvidedValue = {
  challengeId: string;
  challengeLabel: string;
  wordDefinitions: WordDefinition[];
  challenges: AllChallenges[];
  lessonSlug: string;
  courseSlug: string;
};

export const { Provider: DrillProvider, useContext: useDrillContext } = generateContext<
  ProviderProps,
  ProvidedValue
>(
  (Provider) =>
    function DrillProvider({
      children,
      drillTitle,
      words,
      courseSlug,
      lessonSlug,
      drillSlug,
    }: ProviderProps) {
      const [userSettings] = useUserSettings();
      const calculatedChallenges = words.flatMap(
        ({ characters, meaning, id, pinyin, audioSrc, emojiChallenge }): AllChallenges[] => {
          const result: AllChallenges[] = [
            { type: "audio-challenge", id: `${id}-audio`, pinyin, src: audioSrc },
            {
              type: "definition-challenge",
              definition: meaning,
              id: `${id}-definition`,
              pinyin,
            },
          ];
          if (emojiChallenge != null)
            result.push({
              type: "character-challenge",
              id: `${id}-emoji`,
              pinyin,
              character: emojiChallenge,
            });
          if (userSettings.enableCharacterChallenges)
            result.push({
              type: "character-challenge",
              id: `${id}-pinyin`,
              pinyin,
              character: characters,
            });
          return result;
        },
      );
      return (
        <Provider
          value={{
            challengeId: drillSlug,
            challengeLabel: drillTitle,
            wordDefinitions: words,
            challenges: calculatedChallenges,
            courseSlug,
            lessonSlug,
          }}
        >
          {children}
        </Provider>
      );
    },
);
