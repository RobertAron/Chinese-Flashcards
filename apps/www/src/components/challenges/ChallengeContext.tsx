"use client";
import { generateContext } from "@/utils/createContext";
import type React from "react";
import type { DrillInfo } from "./challengeServerUtils";
import { useUserSettings } from "@/utils/playerState";

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
  challenges: AllChallenges[];
  lessonSlug: string;
  courseSlug: string;
};

function wordOrPhraseToChallenges(
  userSettings: ReturnType<typeof useUserSettings>[0],
  words: PhraseOrWordDefinition[],
) {
  return words.flatMap((wordOrPhrase): AllChallenges[] => {
    const { characters, meaning, id, pinyin, audioSrc, emojiChallenge } = wordOrPhrase;
    const wordIds =
      wordOrPhrase.type === "word" ? [wordOrPhrase.id] : wordOrPhrase.words.map((ele) => ele.id);
    const result: AllChallenges[] = [
      { type: "audio-challenge", id: `${id}-audio`, pinyin, src: audioSrc, wordIds },
      {
        type: "definition-challenge",
        definition: meaning,
        id: `${id}-definition`,
        pinyin,
        wordIds,
      },
    ];
    if (emojiChallenge != null)
      result.push({
        type: "character-challenge",
        id: `${id}-emoji`,
        pinyin,
        characters: emojiChallenge,
        wordIds,
      });
    if (userSettings.enableCharacterChallenges)
      result.push({
        type: "character-challenge",
        id: `${id}-pinyin`,
        pinyin,
        characters: characters,
        wordIds,
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
      const wordChallenges = wordOrPhraseToChallenges(userSettings, words);
      const phraseChallenges = wordOrPhraseToChallenges(userSettings, phrases);
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
