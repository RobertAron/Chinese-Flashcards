type TypingChallengeCore = {
  id: string;
  pinyin: string;
  wordIds: number[];
};
export interface TypingCharacterChallenge extends TypingChallengeCore {
  type: "typing-character-challenge";
  characters: string;
}

export interface TypingAudioChallenge extends TypingChallengeCore {
  type: "typing-audio-challenge";
  src: string;
}
export interface TypingDefinitionChallenge extends TypingChallengeCore {
  type: "typing-definition-challenge";
  definition: string;
}
export interface TypingImageChallenge extends TypingChallengeCore {
  type: "typing-image-challenge";
  imageSrc: string;
  definition: string;
}

export type AllTypingChallenges =
  | TypingCharacterChallenge
  | TypingAudioChallenge
  | TypingDefinitionChallenge
  | TypingImageChallenge;

export type McqAnswer = { correct: boolean; text: string; id: string };
type MultipleChoiceCore = {
  id: string;
  getOptions: () => McqAnswer[];
  wordIds: number[];
};
export interface McqText extends MultipleChoiceCore {
  type: "multiple-choice-question-character-text";
  questionText: string;
}
export interface McqAudio extends MultipleChoiceCore {
  type: "multiple-choice-question-character-audio";
  audio: string;
}

export type AllMultipleChoiceChallenges = McqText | McqAudio;

export type SentenceWord = { character: string; id: string };
export interface SentenceBuildingChallenge {
  type: "sentence-building-challenge";
  id: string;
  wordIds: number[];
  englishTranslation: string;
  words: SentenceWord[];
  correctOrder: string[];
}

export type AllChallengeTypes = AllTypingChallenges | AllMultipleChoiceChallenges | SentenceBuildingChallenge;
