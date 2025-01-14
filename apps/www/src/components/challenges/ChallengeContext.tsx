"use client";
import { allChallenges } from "@/challenges/allChalenges";
import { WordDefinition } from "@/challenges/types";
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
  fileName: string;
};
type DefinitionChallenge = {
  type: "definition-challenge";
  id: string;
  pinyin: string;
  definition: string;
};
export type AllChallenges =
  | PinyinChallenge
  | AudioChallenge
  | DefinitionChallenge;
type ProvidedValue = {
  challengeId: string;
  challengeLabel: string;
  wordDefinitions: WordDefinition[];
  challenges: AllChallenges[];
};

export const { Provider: ChallengeProvider, useContext: useChallengeContext } =
  generateContext<ProviderProps, ProvidedValue>(
    (Provider) =>
      function ChallengeProvider({ children }: ProviderProps) {
        const challengeId = useParams()["challengeId"];
        if (typeof challengeId !== "string") return null;
        const selectedChallenge = allChallenges[challengeId];
        if (selectedChallenge === undefined) return null;
        const calculatedChallenges = selectedChallenge.words.flatMap(
          ({
            character,
            definition,
            id,
            pinyin,
            fileName,
          }): AllChallenges[] => [
            {
              type: "pinyin-challenge",
              id: `${id}-pinyin`,
              pinyin,
              character,
            },
            { type: "audio-challenge", id: `${id}-audio`, pinyin, fileName },
            {
              type: "definition-challenge",
              definition,
              id: `${id}-definition`,
              pinyin,
            },
          ],
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
