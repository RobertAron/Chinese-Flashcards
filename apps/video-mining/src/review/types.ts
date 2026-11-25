import type { PhraseRow } from "../db";
import type { WordInfo } from "../dictionary";

export type PhraseView = PhraseRow & {
  frames: { index: number; time: number; saliencyX: number | null }[];
  wordInfo: WordInfo[];
};

export type ProjectView = {
  name: string;
  width: number;
  imageArea: { y: number; height: number };
  framesPerPhrase: number;
  /** project.json's countAsHsk1 list. */
  countAsHsk1: string[];
};
