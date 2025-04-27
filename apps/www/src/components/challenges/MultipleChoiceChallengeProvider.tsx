"use client";
import { generateContext } from "@/utils/createContext";
import { useUserSettings } from "@/utils/playerState";
import type React from "react";
import { useDrillContext } from "./DrillProvider";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";
import { shuffle } from "@/utils/structureUtils";

export type Answer = { correct: boolean; text: string; id: string };
type MultipleChoiceCore = {
  id: string;
  options: Answer[];
  wordIds: number[];
};
export interface MultipleChoiceText extends MultipleChoiceCore {
  type: "typing-character-text";
  questionText: string;
}
export interface MultipleChoiceAudio extends MultipleChoiceCore {
  type: "typing-character-audio";
  audio: string;
}

export type AllMultipleChoiceChallenges = MultipleChoiceText | MultipleChoiceAudio;

export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
function wordOrPhraseToChoices(
  userSettings: ReturnType<typeof useUserSettings>[0],
  words: PhraseOrWordDefinition[],
) {
  const normalizedWords = words.map((wordOrPhrase) => {
    const wordIds =
      wordOrPhrase.type === "word" ? [wordOrPhrase.id] : wordOrPhrase.words.map((ele) => ele.id);
    return {
      ...wordOrPhrase,
      wordIds,
    };
  });
  type NormalizedWord = (typeof normalizedWords)[number];
  return normalizedWords.flatMap((wordOrPhrase, index): (() => AllMultipleChoiceChallenges)[] => {
    const buildQuestion = ({
      questionVariant,
      type,
      getQuestion,
      getAnswer,
    }: {
      questionVariant: string;
      type: "audio" | "text";
      getQuestion: (item: NormalizedWord) => string;
      getAnswer: (item: NormalizedWord) => string;
    }): AllMultipleChoiceChallenges => {
      const questionId = `${questionVariant}-${wordOrPhrase.type}-${wordOrPhrase.id}`;
      const copy = normalizedWords.slice();
      copy.splice(index, 1);
      const otherWords = [
        ...copy.splice(Math.floor(Math.random() * (copy.length - 1)), 1),
        ...copy.splice(Math.floor(Math.random() * (copy.length - 1)), 1),
        ...copy.splice(Math.floor(Math.random() * (copy.length - 1)), 1),
      ].map((ele) => {
        const answerId = `${questionId}-${ele.id}`;
        return {
          correct: false,
          id: answerId,
          text: getAnswer(ele),
        };
      });
      return {
        id: questionId,
        options: shuffle([
          { correct: true, text: getAnswer(wordOrPhrase), id: `${questionId}-correct` },
          ...otherWords,
        ]),
        wordIds: wordOrPhrase.wordIds,
        ...(type === "text"
          ? {
              type: "typing-character-text",
              questionText: getQuestion(wordOrPhrase),
            }
          : {
              type: "typing-character-audio",
              audio: getQuestion(wordOrPhrase),
            }),
      };
    };
    return [
      () =>
        buildQuestion({
          questionVariant: "meaning-characters",
          type: "text",
          getQuestion: (item) => item.meaning,
          getAnswer: (item) => item.characters,
        }),
      () =>
        buildQuestion({
          questionVariant: "characters-meaning",
          type: "text",
          getQuestion: (item) => item.characters,
          getAnswer: (item) => item.meaning,
        }),
      () =>
        buildQuestion({
          questionVariant: "audio-meaning",
          type: "audio",
          getQuestion: (item) => item.audioSrc,
          getAnswer: (item) => item.meaning,
        }),
      () =>
        buildQuestion({
          questionVariant: "audio-characters",
          type: "audio",
          getQuestion: (item) => item.audioSrc,
          getAnswer: (item) => item.characters,
        }),
    ];
  });
}

type ProviderProps = {
  children?: React.ReactNode;
};
type ProvidedValue = {
  challenges: (() => AllMultipleChoiceChallenges)[];
};
export const { Provider: MultipleChoiceChallengeProvider, useContext: useMultipleChoiceChallengeProvider } =
  generateContext<ProviderProps, ProvidedValue>(
    (Provider) =>
      function DrillProvider({ children }: ProviderProps) {
        const [userSettings] = useUserSettings();
        const { wordDefinitions, phraseDefinitions } = useDrillContext();
        const wordChallenges = wordOrPhraseToChoices(userSettings, wordDefinitions);
        const phraseChallenges = wordOrPhraseToChoices(userSettings, phraseDefinitions);
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
