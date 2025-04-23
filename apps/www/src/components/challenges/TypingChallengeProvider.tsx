"use client";
import { generateContext } from "@/utils/createContext";
import { useUserSettings } from "@/utils/playerState";
import type React from "react";
import type { AllTypingChallenges } from "./ChallengeTypes";
import { useDrillContext } from "./DrillProvider";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";

export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
function wordOrPhraseToChallenges(
  userSettings: ReturnType<typeof useUserSettings>[0],
  words: PhraseOrWordDefinition[],
) {
  return words.flatMap((wordOrPhrase): AllTypingChallenges[] => {
    const { characters, meaning, id, pinyin, audioSrc, emojiChallenge } = wordOrPhrase;
    const wordIds =
      wordOrPhrase.type === "word" ? [wordOrPhrase.id] : wordOrPhrase.words.map((ele) => ele.id);
    const result: AllTypingChallenges[] = [
      { type: "typing-audio-challenge", id: `${id}-audio`, pinyin, src: audioSrc, wordIds },
      {
        type: "typing-definition-challenge",
        definition: meaning,
        id: `${id}-definition`,
        pinyin,
        wordIds,
      },
    ];
    if (emojiChallenge != null)
      result.push({
        type: "typing-character-challenge",
        id: `${id}-emoji`,
        pinyin,
        characters: emojiChallenge,
        wordIds,
      });
    if (userSettings.enableCharacterChallenges)
      result.push({
        type: "typing-character-challenge",
        id: `${id}-pinyin`,
        pinyin,
        characters,
        wordIds,
      });
    return result;
  });
}

type ProviderProps = {
  children?: React.ReactNode;
};
type ProvidedValue = {
  challenges: AllTypingChallenges[];
};
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
