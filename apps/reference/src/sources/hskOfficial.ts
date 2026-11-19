import { readFile } from "node:fs/promises";
import type { HskLevel } from "../types";

/** One row of sources/hsk-official/words.json, written by scripts/parseHskOfficial.ts. */
export type OfficialHskWord = {
  /** Row number (序号) in the syllabus. */
  id: number;
  /** The word as printed, minus the homograph number (本1 → 本). */
  simplified: string;
  /** Homograph number the syllabus appends to tell apart same-character words (本1, 本2). */
  homograph?: number;
  hskLevel: HskLevel;
  /** Dictionary pinyin, words separated by a space ("nǐ hǎo"). */
  pinyin: string;
  /** Parts of speech at `hskLevel`, e.g. ["数"]. Empty when the syllabus gives none. */
  partsOfSpeech: string[];
  /**
   * Parts of speech introduced at a higher level. The PDF prints these in parentheses: 对 is level
   * "1（4）" with parts of speech "形、介、（动、量）", so its verb and measure-word senses are level 4.
   */
  laterSenses: { hskLevel: HskLevel; partsOfSpeech: string[] }[];
};

export type HskOfficialRecord = Omit<OfficialHskWord, "simplified">;

const wordsPath = new URL("../../sources/hsk-official/words.json", import.meta.url);

/** hsk-official records keyed by simplified characters. */
export const loadHskOfficial = async () => {
  const words: OfficialHskWord[] = JSON.parse(await readFile(wordsPath, "utf8"));
  const entries = words.map(({ simplified, ...record }) => ({ simplified, record }));
  return Map.groupBy(entries, (entry) => entry.simplified);
};
