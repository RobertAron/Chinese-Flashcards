"use client";
import { generateContext } from "@/utils/createContext";
import { useUserSettings } from "@/utils/playerState";
import type React from "react";
import { useDrillContext } from "./DrillProvider";

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
type ProviderProps = {
  children?: React.ReactNode;
};
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
  challenges: AllChallenges[];
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
        characters,
        wordIds,
      });
    return result;
  });
}

export const { Provider: TypingChallengeProvider, useContext: useTypingChallenge } = generateContext<
  ProviderProps,
  ProvidedValue
>(
  (Provider) =>
    function DrillProvider({ children }: ProviderProps) {
      const [userSettings] = useUserSettings();
      const { wordDefinitions, phraseDefinitions } = useDrillContext();
      const wordChallenges = wordOrPhraseToChallenges(userSettings, wordDefinitions);
      const phraseChallenges = wordOrPhraseToChallenges(userSettings, phraseDefinitions);
      return (
        <Provider
          value={{
            challenges: [...wordChallenges, ...phraseChallenges],
          }}
        >
          {children}
        </Provider>
      );
    },
);
