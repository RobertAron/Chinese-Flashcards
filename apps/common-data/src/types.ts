export type ChallengeDefinition = {
  id:string;
  label: string;
  words: WordDefinition[];
};

export type WordDefinition = {
  id: string;
  character: string;
  pinyin: string;
  definition: string;
  fileName: string;
  emoji?: string;
};
