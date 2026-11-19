import type { CompleteHskRecord } from "./sources/completeHsk";
import type { HskOfficialRecord } from "./sources/hskOfficial";

/** Same values as the `HskLevel` enum in vocab-db, so the two can be compared directly. */
export type HskLevel = "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6" | "hsk7";

export const hskLevels: readonly HskLevel[] = ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6", "hsk7"];

/** What each source knows about one word. Add a member here when adding a new source under src/sources. */
export type SourceRecords = {
  "complete-hsk": CompleteHskRecord;
  "hsk-official": HskOfficialRecord;
};

export type SourceName = keyof SourceRecords;

export type { CompleteHskRecord, HskOfficialRecord };

/** Everything known about one simplified word, kept separate per source. */
export type ReferenceEntry = {
  simplified: string;
  /** The official syllabus's level when it lists the word, otherwise complete-hsk's lowest level. */
  hskLevel?: HskLevel;
  /**
   * Every source's records for the word, in the source's own vocabulary (complete-hsk's parts of speech
   * are "v", "n"; hsk-official's are "动", "名"). An empty list means the source doesn't have the word;
   * more than one means it lists the word more than once (homographs like 本1 and 本2).
   */
  sources: { [Source in SourceName]: SourceRecords[Source][] };
};
