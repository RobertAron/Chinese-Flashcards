"use client";
import { allChallenges } from "@/challenges/allChallenges";
import { generateContext } from "@/utils/createContext";
import type { WordDefinition } from "common-data/types";
import { useParams } from "next/navigation";
import type React from "react";
import { useUserSettings } from "../useUserSettings";

type ProviderProps = {
  children?: React.ReactNode;
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
  fileName: string;
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
};

export const { Provider: ChallengeProvider, useContext: useChallengeContext } = generateContext<
  ProviderProps,
  ProvidedValue
>(
  (Provider) =>
    function ChallengeProvider({ children }: ProviderProps) {
      const challengeId = useParams()["challengeId"];
      const [userSettings] = useUserSettings();
      if (typeof challengeId !== "string") return null;
      const selectedChallenge = allChallenges[challengeId];
      if (selectedChallenge === undefined) return null;
      const calculatedChallenges = selectedChallenge.words.flatMap(
        ({ character, definition, id, pinyin, fileName, emoji }): AllChallenges[] => {
          const result: AllChallenges[] = [
            { type: "audio-challenge", id: `${id}-audio`, pinyin, fileName },
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
            challengeId,
            challengeLabel: selectedChallenge.label,
            wordDefinitions: selectedChallenge.words,
            challenges: calculatedChallenges,
          }}
        >
          {children}
        </Provider>
      );
    },
);
