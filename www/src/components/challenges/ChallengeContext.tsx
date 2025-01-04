"use client";
import { WordDefinition, wordDefinitions } from "@/challenges/top100";
import { generateContext } from "@/utils/createContext";
import { useParams } from "next/navigation";
import React from "react";

type ProviderProps = {
  children?: React.ReactNode;
};
type PinyinChallenge = {
  type: "pinyin-challenge";
  id: string;
  character: string;
  pinyin: string;
};
type AudioChallenge = {
  type: "audio-challenge";
  id: string;
  pinyin: string;
};
type DefinitionChallenge = {
  type: "definition-challenge";
  id: string;
  pinyin: string;
  definition: string;
};
export type AllChallenges = PinyinChallenge | AudioChallenge | DefinitionChallenge;
type ProvidedValue = {
  challengeId: string;
  wordDefinitions: WordDefinition[];
  challenges: AllChallenges[];
};

export const { Provider: ChallengeProvider, useContext: useChallengeContext } =
  generateContext<ProviderProps, ProvidedValue>(
    (Provider) =>
      function ChallengeProvider({ children }: ProviderProps) {
        const challengeId = useParams()["challengeId"];
        if (typeof challengeId !== "string") return null;
        const selectedDefinitions = wordDefinitions[challengeId];
        if (selectedDefinitions === undefined) return null;
        const calculatedChallenges = selectedDefinitions.flatMap(
          ({ character, definition, id, pinyin }): AllChallenges[] => [
            {
              type: "pinyin-challenge",
              id: `${id}-pinyin`,
              pinyin,
              character,
            },
            { type: "audio-challenge", id: `${id}-audio`, pinyin },
            {
              type: "definition-challenge",
              definition,
              id: `${id}-audio`,
              pinyin,
            },
          ],
        );
        return (
          <Provider
            value={{
              challengeId,
              wordDefinitions: selectedDefinitions,
              challenges: calculatedChallenges,
            }}
          >
            {children}
          </Provider>
        );
      },
  );
