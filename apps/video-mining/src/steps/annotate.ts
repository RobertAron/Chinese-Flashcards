import { readFile } from "node:fs/promises";
import z from "zod";
import type { CueRow } from "../db";
import { openDatabase } from "../db";
import { joinWords, loadDictionary } from "../dictionary";
import { loadProject } from "../project";

/**
 * Prints cues as tab-separated lines for annotation: id, start, duration, English, OCR (and a differing
 * second OCR reading after " | "). Pass a cue id range to print a batch.
 */
export async function exportForAnnotation(folder: string, from = 1, to = Number.POSITIVE_INFINITY) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const cues = database
    .query<CueRow, [number, number]>("SELECT * FROM cues WHERE id >= ? AND id <= ? ORDER BY id")
    .all(from, Number.isFinite(to) ? to : 1e9);
  for (const cue of cues) {
    const ocr = cue.ocr_alt ? `${cue.ocr_text} | ${cue.ocr_alt}` : (cue.ocr_text ?? "");
    console.log(
      [cue.id, cue.start.toFixed(1), (cue.end - cue.start).toFixed(1), cue.english, ocr].join("\t"),
    );
  }
}

/**
 * One annotation decision. `cues` are consecutive cue ids that form one phrase. Rejected phrases may leave
 * out `chinese` and `meaning`, which then default to the OCR text and the English cue.
 */
export const annotationSchema = z
  .object({
    cues: z.number().int().array().nonempty(),
    keep: z.boolean(),
    chinese: z.string().trim().nonempty().optional(),
    meaning: z.string().trim().nonempty().optional(),
    reason: z.string().optional(),
  })
  .refine((annotation) => !annotation.keep || (annotation.chinese && annotation.meaning), {
    message: "Kept phrases need chinese and meaning",
  })
  .refine(
    (annotation) =>
      annotation.cues.every((cue, index) => index === 0 || cue === annotation.cues[index - 1]! + 1),
    {
      message: "Cue ids must be consecutive",
    },
  );
export type Annotation = z.output<typeof annotationSchema>;

/** Creates phrases from an annotation file. Phrases that already exist (same first cue) are left alone. */
export async function applyAnnotations(folder: string, annotationFile: string) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const annotations = annotationSchema.array().parse(JSON.parse(await readFile(annotationFile, "utf8")));
  const cues = new Map(
    database
      .query<CueRow, []>("SELECT * FROM cues")
      .all()
      .map((cue) => [cue.id, cue]),
  );
  const claimed = new Map<number, number>();
  for (const { first_cue, last_cue } of database
    .query<{ first_cue: number; last_cue: number }, []>("SELECT first_cue, last_cue FROM phrases")
    .all()) {
    for (let id = first_cue; id <= last_cue; id++) claimed.set(id, first_cue);
  }
  const dictionary = await loadDictionary(project.config);
  const insert = database.prepare(`
    INSERT INTO phrases (first_cue, last_cue, start, end, ocr_text, english_cue, chinese, meaning, words, hsk_level, status, reject_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const cuesOf = (annotation: Annotation) =>
    annotation.cues.map((id) => {
      const cue = cues.get(id);
      if (cue === undefined) throw new Error(`Unknown cue ${id}`);
      return cue;
    });
  const ocrTextOf = (phraseCues: CueRow[]) => phraseCues.map((cue) => cue.ocr_text ?? "").join(" ");
  const chineseTexts = annotations.map((annotation) => annotation.chinese ?? ocrTextOf(cuesOf(annotation)));
  const splits = await dictionary.segmentMany(chineseTexts);
  let created = 0;
  let skipped = 0;
  database.transaction(() => {
    for (const [index, annotation] of annotations.entries()) {
      const phraseCues = cuesOf(annotation);
      const first = phraseCues[0]!;
      const last = phraseCues.at(-1)!;
      if (claimed.get(first.id) === first.id) {
        skipped++;
        continue;
      }
      const overlap = annotation.cues.find((id) => claimed.has(id));
      if (overlap !== undefined) throw new Error(`Cue ${overlap} already belongs to another phrase`);
      const ocrText = ocrTextOf(phraseCues);
      const englishCue = phraseCues.map((cue) => cue.english).join(" ");
      const chinese = chineseTexts[index]!;
      const words = splits[index]!;
      insert.run(
        first.id,
        last.id,
        first.start,
        last.end,
        ocrText,
        englishCue,
        chinese,
        annotation.meaning ?? englishCue,
        joinWords(words),
        dictionary.phraseLevel(words),
        annotation.keep ? "pending" : "auto_rejected",
        annotation.keep ? null : (annotation.reason ?? null),
      );
      for (const id of annotation.cues) claimed.set(id, first.id);
      created++;
    }
  })();
  console.log(`Created ${created} phrases, skipped ${skipped} that already existed.`);
}
