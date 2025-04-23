"use client";
import { generateContext } from "@/utils/createContext";
import type React from "react";
import type { DrillInfo } from "./challengeServerUtils";

type DefinitionCore = {
  id: number;
  characters: string;
  pinyin: string;
  meaning: string;
  audioSrc: string;
  emojiChallenge: string | null;
};

interface WordDefinition extends DefinitionCore {
  type: "word";
}

interface PhraseDefinition extends DefinitionCore {
  type: "phrase";
  words: { characters: string; pinyin: string; id: number; meaning: string }[];
}

export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
interface ProviderProps extends DrillInfo {
  children?: React.ReactNode;
  courseSlug: string;
  lessonSlug: string;
  drillSlug: string;
}
type CharacterChallenge = {
  type: "character-challenge";
  id: string;
  characters: string;
  pinyin: string;
  wordIds: number[];
};
type AudioChallenge = {
  type: "audio-challenge";
  id: string;
  pinyin: string;
  src: string;
  wordIds: number[];
};
type DefinitionChallenge = {
  type: "definition-challenge";
  id: string;
  pinyin: string;
  definition: string;
  wordIds: number[];
};

export type AllChallenges = CharacterChallenge | AudioChallenge | DefinitionChallenge;
type ProvidedValue = {
  challengeId: string;
  challengeLabel: string;
  description: string | null;
  wordDefinitions: WordDefinition[];
  phraseDefinitions: PhraseDefinition[];
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
      phrases,
      description,
    }: ProviderProps) {
      return (
        <Provider
          value={{
            challengeId: drillSlug,
            challengeLabel: drillTitle,
            wordDefinitions: words,
            phraseDefinitions: phrases,
            description,
            courseSlug,
            lessonSlug,
          }}
        >
          {children}
        </Provider>
      );
    },
);
