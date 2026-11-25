import type { Database } from "bun:sqlite";
import type { PhraseRow } from "../db";
import { openDatabase } from "../db";
import { type Dictionary, joinWords, loadDictionary, splitWords } from "../dictionary";
import { loadProject } from "../project";

/**
 * Re-levels every phrase from its current words (hand-edited splits included) and returns how many changed.
 * `updated_at` is left alone: the phrase itself didn't change, only what its words are worth.
 */
export function relevelPhrases(database: Database, dictionary: Dictionary) {
  const phrases = database.query<Pick<PhraseRow, "id" | "words" | "hsk_level">, []>(
    "SELECT id, words, hsk_level FROM phrases WHERE words IS NOT NULL",
  );
  const update = database.prepare("UPDATE phrases SET hsk_level = ? WHERE id = ?");
  let changed = 0;
  database.transaction(() => {
    for (const phrase of phrases.all()) {
      const level = dictionary.phraseLevel(splitWords(phrase.words ?? ""));
      if (level === phrase.hsk_level) continue;
      update.run(level, phrase.id);
      changed++;
    }
  })();
  return changed;
}

/**
 * Re-levels every phrase against the current dictionary (e.g. after changing a word's level in the study
 * app). With `resplit`, also re-splits words from the Chinese text, discarding hand-edited splits.
 */
export async function segmentPhrases(folder: string, { resplit = false } = {}) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const dictionary = await loadDictionary(project.config);
  const phrases = database.query<PhraseRow, []>("SELECT * FROM phrases").all();
  const update = database.prepare("UPDATE phrases SET words = ?, hsk_level = ? WHERE id = ?");
  const automatic = await dictionary.segmentMany(phrases.map((phrase) => phrase.chinese));
  let changed = 0;
  database.transaction(() => {
    for (const [index, phrase] of phrases.entries()) {
      const words = resplit || phrase.words === null ? automatic[index]! : splitWords(phrase.words);
      const level = dictionary.phraseLevel(words);
      if (joinWords(words) !== phrase.words || level !== phrase.hsk_level) changed++;
      update.run(joinWords(words), level, phrase.id);
    }
  })();
  console.log(`Checked ${phrases.length} phrases, ${changed} changed.`);
}
