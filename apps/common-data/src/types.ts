export type ChallengeDefinition = {
  label: string;
  words: WordDefinition[];
};

export type WordDefinition = {
  id: number;
  characters: string;
  pinyin: string;
  meaning: string;
  audioSrc: string;
  emojiChallenge: string | null;
};
