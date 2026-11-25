import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { CueRow } from "../db";
import { openDatabase } from "../db";
import { grabFrame, type OcrResult, runPool, runVision } from "../media";
import { loadProject, type Project } from "../project";

const hasChinese = (text: string) => /\p{Script=Han}/u.test(text);
const chineseCount = (text: string) => [...text].filter((character) => hasChinese(character)).length;

/** Reading order: lines top to bottom, then left to right; keeps only lines with Chinese in them. */
export const ocrText = (result: OcrResult | undefined) =>
  (result?.lines ?? [])
    .filter((line) => hasChinese(line.text))
    .sort((a, b) => (a.box[1] ?? 0) - (b.box[1] ?? 0) || (a.box[0] ?? 0) - (b.box[0] ?? 0))
    .map((line) => line.text.trim())
    .join(" ");

/** Crops the subtitle band at each time and OCRs it. Returns text per time, in input order. */
export async function readSubtitleBand(project: Project, samples: { time: number; file: string }[]) {
  await runPool(
    samples,
    8,
    ({ time, file }) => grabFrame(project, time, project.config.subtitleBand, file).then(() => undefined),
    "band crops",
    250,
  );
  const results = await runVision<OcrResult>(
    "ocr",
    samples.map((sample) => sample.file),
  );
  return samples.map((sample) => {
    const result = results.get(sample.file);
    const confidences = (result?.lines ?? [])
      .filter((line) => hasChinese(line.text))
      .map((line) => line.confidence);
    return { text: ocrText(result), confidence: confidences.length ? Math.min(...confidences) : null };
  });
}

/** OCRs the burned-in subtitles at two points in every cue (35% and 70% through). */
export async function ocrCues(folder: string, { force = false } = {}) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const cues = database
    .query<CueRow, []>(`SELECT * FROM cues ${force ? "" : "WHERE ocr_text IS NULL"} ORDER BY id`)
    .all();
  const bandsFolder = join(project.workFolder, "bands");
  await mkdir(bandsFolder, { recursive: true });
  const samples = cues.flatMap((cue) =>
    [0.35, 0.7].map((fraction, index) => ({
      time: cue.start + (cue.end - cue.start) * fraction,
      file: join(bandsFolder, `${cue.id}-${index}.jpg`),
    })),
  );
  console.log(`OCR for ${cues.length} cues…`);
  const readings = await readSubtitleBand(project, samples);
  const update = database.prepare(
    "UPDATE cues SET ocr_text = ?, ocr_alt = ?, ocr_confidence = ? WHERE id = ?",
  );
  database.transaction(() => {
    for (const [index, cue] of cues.entries()) {
      const [first, second] = [readings[index * 2]!, readings[index * 2 + 1]!];
      // The fuller reading wins; a differing second reading is kept for the annotator to check.
      const [best, other] =
        chineseCount(second.text) > chineseCount(first.text) ? [second, first] : [first, second];
      update.run(best.text, other.text !== best.text ? other.text : null, best.confidence, cue.id);
    }
  })();
  const empty = database
    .query<{ count: number }, []>("SELECT count(*) AS count FROM cues WHERE ocr_text = ''")
    .get();
  console.log(`Done. ${empty?.count ?? 0} cues have no Chinese text.`);
}
