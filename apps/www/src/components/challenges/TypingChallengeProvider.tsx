"use client";
import { generateContext } from "@/utils/createContext";
import { type UserSettings, useUserSettings } from "@/utils/playerState";
import type React from "react";
import type { AllMultipleChoiceChallenges, AllTypingChallenges } from "./ChallengeTypes";
import { useDrillContext } from "./DrillProvider";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";
import { shuffle } from "@/utils/structureUtils";

export type NormalizedWord = {
  wordIds: number[];
  type: "word" | "phrase";
  id: number;
  characters: string;
  pinyin: string;
  meaning: string;
  audioSrc: string;
  emojiChallenge: string | null;
};
export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
function wordsToTypingChallenges(userSettings: UserSettings, words: NormalizedWord[]) {
  if (!userSettings.enableTypingChallenges) return [];
  return words.flatMap((wordOrPhrase): AllTypingChallenges[] => {
    const { characters, meaning, id, pinyin, audioSrc, emojiChallenge, type, wordIds } = wordOrPhrase;
    const result: AllTypingChallenges[] = [
      { type: "typing-audio-challenge", id: `${type}-${id}-audio`, pinyin, src: audioSrc, wordIds },
      {
        type: "typing-definition-challenge",
        definition: meaning,
        id: `${type}-${id}-definition`,
        pinyin,
        wordIds,
      },
    ];
    if (emojiChallenge != null)
      result.push({
        type: "typing-character-challenge",
        id: `${type}-${id}-emoji`,
        pinyin,
        characters: emojiChallenge,
        wordIds,
      });
    if (userSettings.enableCharacterChallenges)
      result.push({
        type: "typing-character-challenge",
        id: `${type}-${id}-pinyin`,
        pinyin,
        characters,
        wordIds,
      });
    return result;
  });
}

const buildQuestion = ({
  questionVariant,
  type,
  getQuestion,
  getAnswer,
  word,
  allWords,
  unusableIndex,
}: {
  questionVariant: string;
  type: "audio" | "text";
  getQuestion: (item: NormalizedWord) => string;
  getAnswer: (item: NormalizedWord) => string;
  word: NormalizedWord;
  allWords: NormalizedWord[];
  unusableIndex: number;
}): AllMultipleChoiceChallenges => {
  const questionId = `${questionVariant}-${word.type}-${word.id}`;
  return {
    id: questionId,
    getOptions: () => {
      const copy = allWords.slice();
      copy.splice(unusableIndex, 1);
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
      return shuffle([{ correct: true, text: getAnswer(word), id: `${questionId}-correct` }, ...otherWords]);
    },
    wordIds: word.wordIds,
    ...(type === "text"
      ? {
          type: "multiple-choice-question-character-text",
          questionText: getQuestion(word),
        }
      : {
          type: "multiple-choice-question-character-audio",
          audio: getQuestion(word),
        }),
  };
};
function wordsToMultipleChoiceQuestions(userSettings: UserSettings, words: NormalizedWord[]) {
  if (!userSettings.enableMultipleChoiceChallenges) return [];
  return words.flatMap((word, index) => {
    const core = {
      allWords: words,
      unusableIndex: index,
      word,
    };
    return [
      buildQuestion({
        ...core,
        questionVariant: "meaning-characters",
        type: "text",
        getQuestion: (item) => item.meaning,
        getAnswer: (item) => item.characters,
      }),
      buildQuestion({
        ...core,
        questionVariant: "characters-meaning",
        type: "text",
        getQuestion: (item) => item.characters,
        getAnswer: (item) => item.meaning,
      }),
      buildQuestion({
        ...core,
        questionVariant: "audio-meaning",
        type: "audio",
        getQuestion: (item) => item.audioSrc,
        getAnswer: (item) => item.meaning,
      }),
      buildQuestion({
        ...core,
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
  typingChallenges: AllTypingChallenges[];
  multipleChoiceChallenges: AllMultipleChoiceChallenges[];
};
export const { Provider: TypingChallengeProvider, useContext: useTypingChallenge } = generateContext<
  ProviderProps,
  ProvidedValue
>(
  (Provider) =>
    function DrillProvider({ children }: ProviderProps) {
      const [userSettings] = useUserSettings();
      const { wordDefinitions, phraseDefinitions } = useDrillContext();
      const normalizedWords = wordDefinitions.map(
        (ele): NormalizedWord => ({
          ...ele,
          wordIds: [ele.id],
        }),
      );
      const normalizedPhrases = phraseDefinitions.map(
        ({ words, ...rest }): NormalizedWord => ({
          ...rest,
          wordIds: words.map((ele) => ele.id),
        }),
      );
      const normalizedContent = [...normalizedWords, ...normalizedPhrases];
      const wordChallenges = wordsToTypingChallenges(userSettings, normalizedContent);
      const mcqWords = wordsToMultipleChoiceQuestions(userSettings, normalizedWords);
      const mcqPhrases = wordsToMultipleChoiceQuestions(userSettings, normalizedPhrases);
      return (
        <Provider
          value={{
            typingChallenges: wordChallenges,
            multipleChoiceChallenges: [...mcqWords, ...mcqPhrases],
          }}
        >
          {children}
        </Provider>
      );
    },
);
