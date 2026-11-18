import { readFile } from "node:fs/promises";
import { type HskLevel, hskLevels, type ReferenceEntry } from "../types";

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

const dataDirectory = new URL("../../sources/complete-hsk/", import.meta.url);

const readLevel = async (hskLevel: HskLevel): Promise<CompleteHskEntry[]> =>
  JSON.parse(await readFile(new URL(`${hskLevel}.json`, dataDirectory), "utf8"));

const toReferenceEntry = (entry: CompleteHskEntry, hskLevel: HskLevel): ReferenceEntry => ({
  simplified: entry.simplified,
  readings: entry.forms.map((form) => ({
    traditional: form.traditional,
    pinyin: form.transcriptions.pinyin,
    meanings: form.meanings,
    classifiers: form.classifiers,
    source: "complete-hsk",
  })),
  hskLevel,
  frequencyRank: entry.frequency,
  radical: entry.radical,
  partsOfSpeech: entry.pos,
  sources: ["complete-hsk"],
});

export const loadCompleteHsk = async (): Promise<ReferenceEntry[]> => {
  const levels = await Promise.all(hskLevels.map(readLevel));
  return levels.flatMap((entries, index) =>
    entries.map((entry) => toReferenceEntry(entry, hskLevels[index]!)),
  );
};
