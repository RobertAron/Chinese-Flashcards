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

export type AllTypingChallenges = TypingCharacterChallenge | TypingAudioChallenge | TypingDefinitionChallenge;
