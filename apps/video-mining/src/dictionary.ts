import { Database } from "bun:sqlite";
import { fileURLToPath } from "node:url";
import { hskLevels, loadReference } from "vocab-reference";
import { tokenize } from "./media";
import type { ProjectConfig } from "./project";

/** The study app's database, opened read-only. Its levels include hand fixes (e.g. 玩 is HSK 1), so it wins over vocab-reference. */
export const studyDatabasePath = fileURLToPath(new URL("../../db/local.db", import.meta.url));

/**
 * Unranked interjections that don't make a phrase harder: they count as level 0.
 * Particles that do have an HSK level (呀 hsk4, 啦 hsk6, 嘛 hsk6, 哦 hsk7) keep it.
 */
export const levelZeroParticles = new Set(["嗯", "喽", "哟", "唔", "咦", "呦", "耶", "哈", "呗", "诶", "呃"]);

/** hsk_level for a phrase containing any word outside HSK 1–9 that isn't a name, particle or punctuation. */
export const offListLevel = 8;

export type WordKind = "hsk" | "name" | "particle" | "punctuation" | "unranked";

export type WordInfo = {
  characters: string;
  kind: WordKind;
  /** 1–7 (7 covers HSK 7–9). 0 for names, level-zero particles and punctuation. null when unranked. */
  level: number | null;
  /** On the project's `countAsHsk1` list: `level` is 1 and `kind` is "hsk", whatever the dictionary says. */
  countedAsHsk1: boolean;
  /** The dictionary's level, before `countAsHsk1`. null when unranked. */
  dictionaryLevel: number | null;
  /** Keyboard-style pinyin (no spaces). Several when the study app has several readings. Empty if unknown. */
  pinyin: string[];
  meaning: string | null;
  /** Whether the study app already has a Words row with these characters. */
  inStudyApp: boolean;
  /** The study app's Words rows for these characters, most frequent first. Several for 还 (hái, huán). */
  readings: StudyReading[];
};

/** One study-app Words row. A phrase uses the first unless its review picked another. */
export type StudyReading = { id: number; pinyin: string; meaning: string };

type Entry = {
  level: number | null;
  pinyin: string[];
  meaning: string | null;
  inStudyApp: boolean;
  readings: StudyReading[];
};

/** Best split of a phrase's first N characters, and where its last piece starts. */
type Split = { unranked: number; pieces: number; hardest: number; start: number };
const compareSplits = (a: Split, b: Split) =>
  a.unranked - b.unranked || a.pieces - b.pieces || a.hardest - b.hardest;

const isPunctuation = (text: string) => /^[\p{P}\p{S}]+$/u.test(text);
const levelNumber = (level: string | null | undefined) =>
  level ? hskLevels.indexOf(level as (typeof hskLevels)[number]) + 1 || null : null;
const lowest = (levels: (number | null)[]) =>
  levels.filter((level): level is number => level !== null).sort((a, b) => a - b)[0] ?? null;

async function loadEntries() {
  const study = new Database(studyDatabasePath, { readonly: true });
  const rows = study
    .query<{ id: number; characters: string; pinyin: string; meaning: string; hskLevel: string | null }, []>(
      "SELECT id, characters, pinyin, meaning, hskLevel FROM Words ORDER BY frequencyRank, id",
    )
    .all();
  study.close();
  const reference = await loadReference();
  const studyRows = Map.groupBy(rows, (row) => row.characters);
  const entries = new Map<string, Entry>();
  // For words the study app has, its level is final, even when it's unset (嗯 is unranked there, HSK 4 in reference).
  for (const [characters, readings] of studyRows) {
    entries.set(characters, {
      level: lowest(readings.map((row) => levelNumber(row.hskLevel))),
      pinyin: [...new Set(readings.map((row) => row.pinyin))],
      meaning: readings[0]?.meaning ?? null,
      inStudyApp: true,
      readings: readings.map(({ id, pinyin, meaning }) => ({ id, pinyin, meaning })),
    });
  }
  for (const [characters, entry] of reference) {
    if (entries.has(characters)) continue;
    const forms = entry.sources["complete-hsk"].flatMap((record) => record.forms);
    const pinyin = [
      ...forms.map((form) => form.pinyin),
      ...entry.sources["hsk-official"].map((record) => record.pinyin),
    ].map((reading) => reading.replaceAll(" ", ""));
    entries.set(characters, {
      level: levelNumber(entry.hskLevel),
      pinyin: [...new Set(pinyin)],
      meaning: forms[0]?.meanings.join("; ") ?? null,
      inStudyApp: false,
      readings: [],
    });
  }
  return entries;
}

let entriesPromise: Promise<Map<string, Entry>> | undefined;

/** Makes the next loadDictionary re-read the study app's Words, e.g. after words were added to it. */
export const forgetStudyWords = () => {
  entriesPromise = undefined;
};

/**
 * Splits Chinese text into words and levels them, using the project's `names` and `countAsHsk1` lists.
 * Cheap to call again when those lists change: the dictionary itself loads once per process.
 */
export async function loadDictionary({ names, countAsHsk1 }: Pick<ProjectConfig, "names" | "countAsHsk1">) {
  entriesPromise ??= loadEntries();
  const entries = await entriesPromise;
  const nameSet = new Set(names);
  const hsk1Set = new Set(countAsHsk1);
  const longestWord = Math.max(
    ...[...entries.keys(), ...names, ...countAsHsk1].map((word) => [...word].length),
  );

  const describe = (characters: string): WordInfo => {
    const entry = entries.get(characters);
    const base = {
      characters,
      pinyin: entry?.pinyin ?? [],
      meaning: entry?.meaning ?? null,
      inStudyApp: entry?.inStudyApp ?? false,
      readings: entry?.readings ?? [],
      countedAsHsk1: false,
      dictionaryLevel: entry?.level ?? null,
    };
    if (isPunctuation(characters)) return { ...base, kind: "punctuation", level: 0 };
    if (nameSet.has(characters)) return { ...base, kind: "name", level: 0 };
    if (hsk1Set.has(characters)) return { ...base, kind: "hsk", level: 1, countedAsHsk1: true };
    if (entry?.level != null) return { ...base, kind: "hsk", level: entry.level };
    if (levelZeroParticles.has(characters)) return { ...base, kind: "particle", level: 0 };
    return { ...base, kind: "unranked", level: null };
  };

  /**
   * Picks the split with the fewest unranked pieces (as for the first film, so levels match), then the fewest
   * pieces, then the easiest hardest word. Pieces can be dictionary words, names, single characters, or
   * `tokens`: words Apple's tokenizer found in this text. Tokens keep unknown compounds whole (会馆, not
   * 会 馆) without changing levels, because ranked words still win when they cover the same characters.
   * Aligning to the tokenizer's boundaries was tried and rejected: it splits study-app words like 一下 and 不是.
   */
  const segment = (text: string, tokens: readonly string[] = []): string[] => {
    const characters = [...text.replace(/\s+/g, "")];
    const tokenSet = new Set(tokens);
    const longest = Math.max(longestWord, ...tokens.map((token) => [...token].length));
    const best: (Split | undefined)[] = [{ unranked: 0, pieces: 0, hardest: 0, start: 0 }];
    for (let end = 1; end <= characters.length; end++) {
      for (let start = Math.max(0, end - longest); start < end; start++) {
        const previous = best[start];
        const piece = characters.slice(start, end).join("");
        const isAllowed =
          end - start === 1 ||
          entries.has(piece) ||
          nameSet.has(piece) ||
          hsk1Set.has(piece) ||
          tokenSet.has(piece);
        if (previous === undefined || !isAllowed) continue;
        const info = describe(piece);
        const candidate = {
          unranked: previous.unranked + (info.kind === "unranked" ? 1 : 0),
          pieces: previous.pieces + 1,
          hardest: Math.max(previous.hardest, info.level ?? 0),
          start,
        };
        const current = best[end];
        if (current === undefined || compareSplits(candidate, current) < 0) best[end] = candidate;
      }
    }
    const pieces: string[] = [];
    for (let end = characters.length; end > 0; end = best[end]?.start ?? 0) {
      pieces.unshift(characters.slice(best[end]?.start ?? 0, end).join(""));
    }
    return pieces;
  };

  /** The phrase's level: its hardest word, or offListLevel when any word is unranked. */
  const phraseLevel = (words: readonly string[]) =>
    Math.max(
      0,
      ...words.map(describe).map((info) => (info.kind === "unranked" ? offListLevel : (info.level ?? 0))),
    );

  /** Splits many texts, tokenizing them in one batch first. */
  const segmentMany = async (texts: readonly string[]) => {
    const tokens = await tokenize(texts);
    return texts.map((text, index) => segment(text, tokens[index]));
  };

  return { describe, segment, segmentMany, phraseLevel };
}

export type Dictionary = Awaited<ReturnType<typeof loadDictionary>>;

/** Words are stored space-separated, like the study app's phrase strings ("收拾 一下 ， 我们 出发 。"). */
export const splitWords = (words: string) => words.split(" ").filter((word) => word !== "");
export const joinWords = (words: readonly string[]) => words.join(" ");
