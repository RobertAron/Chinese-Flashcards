import type { PhraseRow } from "../db";
import type { WordInfo } from "../dictionary";

export type PhraseView = PhraseRow & {
  frames: { index: number; time: number; saliencyX: number | null }[];
  /** One per word in `words`, with the study-app reading this phrase uses (null when the study app lacks it). */
  wordInfo: (WordInfo & { readingId: number | null })[];
};

export type ProjectView = {
  name: string;
  width: number;
  imageArea: { y: number; height: number };
  framesPerPhrase: number;
  /** project.json's lists. */
  names: string[];
  countAsHsk1: string[];
};

/** A word some reviewable phrase uses that the study app doesn't have yet, with suggested Words fields. */
export type MissingWord = {
  characters: string;
  isName: boolean;
  approvedPhrases: number;
  pendingPhrases: number;
  example: string;
  pinyin: string;
  meaning: string;
  hskLevel: number | null;
};
