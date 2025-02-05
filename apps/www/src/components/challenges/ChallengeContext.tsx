"use client";
import { generateContext } from "@/utils/createContext";
import type { ChallengeDefinition, WordDefinition } from "common-data/types";
import type React from "react";
import { useUserSettings } from "../useUserSettings";

type ProviderProps = {
  children?: React.ReactNode;
  challengeDefinition: ChallengeDefinition;
  lessonSlug: string;
  courseSlug: string;
};
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
    function DrillProvider({ children, challengeDefinition, courseSlug, lessonSlug }: ProviderProps) {
      const [userSettings] = useUserSettings();
      const calculatedChallenges = challengeDefinition.words.flatMap(
        ({ character, definition, id, pinyin, audioSrc, emoji }): AllChallenges[] => {
          const result: AllChallenges[] = [
            { type: "audio-challenge", id: `${id}-audio`, pinyin, src: audioSrc },
            {
              type: "definition-challenge",
              definition,
              id: `${id}-definition`,
              pinyin,
            },
          ];
          if (emoji !== undefined)
            result.push({
              type: "character-challenge",
              id: `${id}-emoji`,
              pinyin,
              character: emoji,
            });
          if (userSettings.enableCharacterChallenges)
            result.push({
              type: "character-challenge",
              id: `${id}-pinyin`,
              pinyin,
              character,
            });
          return result;
        },
      );
      return (
        <Provider
          value={{
            challengeId: challengeDefinition.id,
            challengeLabel: challengeDefinition.label,
            wordDefinitions: challengeDefinition.words,
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
