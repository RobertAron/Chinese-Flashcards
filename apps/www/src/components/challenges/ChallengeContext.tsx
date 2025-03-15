"use client";
import { useUserSettings } from "@/components/useUserSettings";
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

type WordDefinition = {
  type: "word";
} & DefinitionCore;

type PhraseDefinition = {
  type: "phrase";
  words: { characters: string; pinyin: string; id: number }[];
} & DefinitionCore;

export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
type ProviderProps = {
  children?: React.ReactNode;
  courseSlug: string;
  lessonSlug: string;
  drillSlug: string;
} & DrillInfo;
type CharacterChallenge = {
  type: "character-challenge";
  id: string;
  characters: string;
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
  description: string | null;
  wordDefinitions: WordDefinition[];
  phraseDefinitions: PhraseDefinition[];
  challenges: AllChallenges[];
  lessonSlug: string;
  courseSlug: string;
};

function wordDefinitionToChallenges(
  userSettings: ReturnType<typeof useUserSettings>[0],
  words: PhraseOrWordDefinition[],
) {
  return words.flatMap(({ characters, meaning, id, pinyin, audioSrc, emojiChallenge }): AllChallenges[] => {
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
        characters: emojiChallenge,
      });
    if (userSettings.enableCharacterChallenges)
      result.push({
        type: "character-challenge",
        id: `${id}-pinyin`,
        pinyin,
        characters: characters,
      });
    return result;
  });
}

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
      const [userSettings] = useUserSettings();
      const wordChallenges = wordDefinitionToChallenges(userSettings, words);
      const phraseChallenges = wordDefinitionToChallenges(userSettings, phrases);
      return (
        <Provider
          value={{
            challengeId: drillSlug,
            challengeLabel: drillTitle,
            wordDefinitions: words,
            phraseDefinitions: phrases,
            description,
            challenges: [...wordChallenges, ...phraseChallenges],
            courseSlug,
            lessonSlug,
          }}
        >
          {children}
        </Provider>
      );
    },
);
