"use client";
import { ezCreateContext } from "@/utils/createContext";
import { type UserSettings, useUserSettings } from "@/utils/playerState";
import { shuffle } from "@/utils/structureUtils";
import type { AllMultipleChoiceChallenges, AllTypingChallenges, SentenceBuildingChallenge } from "./ChallengeTypes";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";
import { useDrillContext } from "./DrillProvider";

export type NormalizedWord = {
  wordIds: number[];
  type: "word" | "phrase";
  id: number;
  characters: string;
  pinyin: string;
  meaning: string;
  audioSrc: string;
  imageSrc: string | null;
};
export type PhraseOrWordDefinition = WordDefinition | PhraseDefinition;
function wordsToTypingChallenges(userSettings: UserSettings, words: NormalizedWord[]) {
  if (!userSettings.enableTypingChallenges) return [];
  return words.flatMap((wordOrPhrase): AllTypingChallenges[] => {
    const { characters, meaning, id, pinyin, audioSrc, imageSrc, type, wordIds } = wordOrPhrase;
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
    if (imageSrc != null)
      result.push({
        type: "typing-image-challenge",
        id: `${type}-${id}-emoji`,
        pinyin,
        imageSrc: imageSrc,
        wordIds,
        definition: meaning,
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

function phrasesToSentenceBuildingChallenges(
  userSettings: UserSettings,
  phrases: PhraseDefinition[],
): SentenceBuildingChallenge[] {
  if (!userSettings.enableSentenceBuildingChallenges) return [];
  return phrases
    .filter((phrase) => phrase.words.length >= 2)
    .map((phrase) => {
      const words = phrase.words.map((word, index) => ({
        character: word.characters,
        id: `${phrase.id}-word-${word.id}-${index}`,
      }));
      const correctOrder = words.map((word) => word.id);
      return {
        type: "sentence-building-challenge" as const,
        id: `phrase-${phrase.id}-sentence-building`,
        wordIds: phrase.words.map((w) => w.id),
        englishTranslation: phrase.meaning,
        words,
        correctOrder,
      };
    });
}

type ProvidedValue = {
  typingChallenges: AllTypingChallenges[];
  multipleChoiceChallenges: AllMultipleChoiceChallenges[];
  sentenceBuildingChallenges: SentenceBuildingChallenge[];
};
const { Provider: TypingChallengeProvider, useContext: useTypingChallenge } = ezCreateContext<ProvidedValue>(
  (P) => (props) => {
    const { children } = props;
    const [userSettings] = useUserSettings();
    const { wordDefinitions, phraseDefinitions } = useDrillContext();
    const normalizedWords = wordDefinitions.map(
      (ele): NormalizedWord => ({
        ...ele,
        wordIds: [ele.id],
        imageSrc: null,
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
    const sentenceBuildingChallenges = phrasesToSentenceBuildingChallenges(userSettings, phraseDefinitions);
    return (
      <P
        value={{
          typingChallenges: wordChallenges,
          multipleChoiceChallenges: [...mcqWords, ...mcqPhrases],
          sentenceBuildingChallenges,
        }}
      >
        {children}
      </P>
    );
  },
);
export { TypingChallengeProvider, useTypingChallenge };
