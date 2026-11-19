import { readFile } from "node:fs/promises";
import { type HskLevel, hskLevels } from "../types";

/** Raw shape of https://github.com/drkameleon/complete-hsk-vocabulary entries. */
type CompleteHskEntry = {
  simplified: string;
  radical: string;
  frequency: number;
  pos: string[];
  forms: {
    traditional: string;
    transcriptions: { pinyin: string; numeric: string };
    meanings: string[];
    classifiers: string[];
  }[];
};

export type CompleteHskRecord = {
  hskLevel: HskLevel;
  /** Corpus frequency rank: lower means more common. */
  frequencyRank: number;
  radical: string;
  /** ICTCLAS part-of-speech codes, e.g. ["v", "n"]. */
  partsOfSpeech: string[];
  /** One per pronunciation. */
  forms: {
    traditional: string;
    /** Dictionary pinyin, every syllable separated by a space ("ài hào"). */
    pinyin: string;
    meanings: string[];
    classifiers: string[];
  }[];
};

const dataDirectory = new URL("../../sources/complete-hsk/", import.meta.url);

const readLevel = async (hskLevel: HskLevel): Promise<CompleteHskEntry[]> =>
  JSON.parse(await readFile(new URL(`${hskLevel}.json`, dataDirectory), "utf8"));

const toRecord = (entry: CompleteHskEntry, hskLevel: HskLevel): CompleteHskRecord => ({
  hskLevel,
  frequencyRank: entry.frequency,
  radical: entry.radical,
  partsOfSpeech: entry.pos,
  forms: entry.forms.map((form) => ({
    traditional: form.traditional,
    pinyin: form.transcriptions.pinyin,
    meanings: form.meanings,
    classifiers: form.classifiers,
  })),
});

/** complete-hsk records keyed by simplified characters. */
export const loadCompleteHsk = async () => {
  const levels = await Promise.all(hskLevels.map(readLevel));
  const entries = levels.flatMap((entries, index) =>
    entries.map((entry) => ({ simplified: entry.simplified, record: toRecord(entry, hskLevels[index]!) })),
  );
  return Map.groupBy(entries, (entry) => entry.simplified);
};
