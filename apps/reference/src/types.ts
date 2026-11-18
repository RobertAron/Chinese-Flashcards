/** Same values as the `HskLevel` enum in vocab-db, so the two can be compared directly. */
export type HskLevel = "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6" | "hsk7";

export const hskLevels: readonly HskLevel[] = ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6", "hsk7"];

/** Name of a data source. Add a member here when adding a new source under src/sources. */
export type SourceName = "complete-hsk";

/** One pronunciation of a word, with the meanings that go with it. */
export type Reading = {
  traditional: string;
  /** Dictionary pinyin with tone marks, syllables separated by spaces (e.g. "Ā lā bó yǔ"). */
  pinyin: string;
  meanings: string[];
  classifiers: string[];
  source: SourceName;
};

/** Everything known about one simplified word, consolidated across sources. */
export type ReferenceEntry = {
  simplified: string;
  readings: Reading[];
  /** Lowest HSK level any source assigns the word. */
  hskLevel?: HskLevel;
  /** Corpus frequency rank: lower means more common. */
  frequencyRank?: number;
  radical?: string;
  partsOfSpeech: string[];
  sources: SourceName[];
};
