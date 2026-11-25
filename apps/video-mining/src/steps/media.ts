import { existsSync } from "node:fs";
import type { CueRow, PhraseRow } from "../db";
import { openDatabase } from "../db";
import { cutAudio, grabFrameSeries, runPool, runVision, type SaliencyResult } from "../media";
import { audioPath, framePath, loadProject, type Project } from "../project";

/** Height of saved candidate frames. Cards are exported at 768×768, so frames keep the full card resolution. */
export const frameHeight = 768;

/** The audio clip for a phrase: its cues plus padding, never reaching into the neighbouring cues' speech. */
export function clipRange(
  project: Project,
  phrase: Pick<PhraseRow, "start" | "end">,
  previous?: CueRow,
  next?: CueRow,
) {
  const { before, after } = project.config.clipPadding;
  const clipStart = Math.min(phrase.start, Math.max(phrase.start - before, previous?.end ?? 0, 0));
  const clipEnd = Math.max(phrase.end, Math.min(phrase.end + after, next?.start ?? Number.POSITIVE_INFINITY));
  return { clipStart, clipEnd };
}

/** Times for the candidate frames, spread across the phrase with a little lead-in and run-out. */
export const frameTimes = (start: number, end: number, count: number) => {
  const [from, to] = [Math.max(0, start - 0.4), end + 0.4];
  return Array.from({ length: count }, (_, index) => from + ((index + 0.5) * (to - from)) / count);
};

/**
 * Where the square crop should sit, as a fraction of how far it can travel (0 = left edge, 1 = right edge),
 * centred on the area-weighted middle of Vision's salient objects. This is the same convention as CSS
 * background-position percentages.
 */
export function cropPosition(result: SaliencyResult | undefined, squareFraction: number) {
  const boxes = result?.boxes ?? [];
  const weights = boxes.map(({ box, confidence }) => (box[2] ?? 0) * (box[3] ?? 0) * confidence);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0 || squareFraction >= 1) return 0.5;
  const centre =
    boxes.reduce((sum, { box }, index) => sum + ((box[0] ?? 0) + (box[2] ?? 0) / 2) * weights[index]!, 0) /
    total;
  return Math.min(1, Math.max(0, (centre - squareFraction / 2) / (1 - squareFraction)));
}

/** Cuts audio clips and candidate frames (with saliency) for every phrase that doesn't have them yet. */
export async function extractMedia(folder: string, { force = false } = {}) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const { framesPerPhrase, imageArea, width } = project.config;
  const cues = new Map(
    database
      .query<CueRow, []>("SELECT * FROM cues")
      .all()
      .map((cue) => [cue.id, cue]),
  );
  const phrases = database.query<PhraseRow, []>("SELECT * FROM phrases ORDER BY id").all();

  const needsAudio = phrases.filter(
    (phrase) => force || phrase.clip_start === null || !existsSync(audioPath(project, phrase.id)),
  );
  const updateClip = database.prepare("UPDATE phrases SET clip_start = ?, clip_end = ? WHERE id = ?");
  console.log(`Cutting ${needsAudio.length} audio clips…`);
  await runPool(
    needsAudio,
    8,
    async (phrase) => {
      const { clipStart, clipEnd } = clipRange(
        project,
        phrase,
        cues.get(phrase.first_cue - 1),
        cues.get(phrase.last_cue + 1),
      );
      await cutAudio(project, clipStart, clipEnd, audioPath(project, phrase.id));
      updateClip.run(clipStart, clipEnd, phrase.id);
    },
    "clips",
    250,
  );

  const existingFrames = new Set(
    database
      .query<{ phrase_id: number }, []>("SELECT DISTINCT phrase_id FROM frames")
      .all()
      .map((row) => row.phrase_id),
  );
  const needsFrames = phrases.filter((phrase) => force || !existingFrames.has(phrase.id));
  const frames = needsFrames.flatMap((phrase) =>
    frameTimes(phrase.start, phrase.end, framesPerPhrase).map((time, index) => ({
      phrase,
      index,
      time,
      file: framePath(project, phrase.id, index),
    })),
  );
  console.log(`Saving ${frames.length} candidate frames…`);
  const strip = { x: 0, y: imageArea.y, width, height: imageArea.height };
  await runPool(
    needsFrames,
    8,
    async (phrase) => {
      const times = frameTimes(phrase.start, phrase.end, framesPerPhrase);
      const series = {
        firstTime: times[0]!,
        interval: (times[1] ?? times[0]! + 1) - times[0]!,
        count: times.length,
      };
      await grabFrameSeries(project, series, strip, framePath(project, phrase.id, "%d"), frameHeight);
    },
    "phrases' frames",
    250,
  );

  console.log("Finding salient regions…");
  const saliency = await runVision<SaliencyResult>(
    "saliency",
    frames.map((frame) => frame.file),
  );
  const squareFraction = imageArea.height / width;
  const insertFrame = database.prepare(
    "INSERT OR REPLACE INTO frames (phrase_id, idx, time, saliency_x) VALUES (?, ?, ?, ?)",
  );
  const defaultFrame = database.prepare("UPDATE phrases SET frame = coalesce(frame, ?) WHERE id = ?");
  database.transaction(() => {
    for (const frame of frames) {
      insertFrame.run(
        frame.phrase.id,
        frame.index,
        frame.time,
        cropPosition(saliency.get(frame.file), squareFraction),
      );
    }
    for (const phrase of needsFrames) defaultFrame.run(Math.floor((framesPerPhrase - 1) / 2), phrase.id);
  })();
  console.log("Done.");
}
