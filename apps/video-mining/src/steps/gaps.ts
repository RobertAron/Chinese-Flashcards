import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { CueRow } from "../db";
import { openDatabase } from "../db";
import { loadProject } from "../project";
import { readSubtitleBand } from "./ocr";

/**
 * Coverage check: samples the subtitle band every `step` seconds wherever there's no cue for `minimumGap`
 * seconds or more, and records any Chinese it finds in gap_hits. Hits are burned-in lines the timed
 * subtitle track is missing.
 */
export async function checkGaps(folder: string, { minimumGap = 3, step = 1.5 } = {}) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const cues = database.query<CueRow, []>("SELECT * FROM cues ORDER BY start").all();
  const duration = Number(
    (
      await Bun.$`ffprobe -v error -show_entries format=duration -of csv=p=0 ${join(project.root, project.config.video)}`.text()
    ).trim(),
  );
  const edges = [{ end: 0 }, ...cues, { start: duration }] as { start?: number; end?: number }[];
  const times = edges.slice(1).flatMap((cue, index) => {
    const gapStart = (edges[index]?.end ?? 0) + 0.5;
    const gapEnd = (cue.start ?? duration) - 0.5;
    if (gapEnd - gapStart < minimumGap - 1) return [];
    return Array.from({ length: Math.floor((gapEnd - gapStart) / step) + 1 }, (_, k) => gapStart + k * step);
  });
  const gapsFolder = join(project.workFolder, "gaps");
  await mkdir(gapsFolder, { recursive: true });
  console.log(`Sampling ${times.length} points in gaps…`);
  const readings = await readSubtitleBand(
    project,
    times.map((time) => ({ time, file: join(gapsFolder, `${time.toFixed(2)}.jpg`) })),
  );
  const insert = database.prepare("INSERT OR REPLACE INTO gap_hits (time, ocr_text) VALUES (?, ?)");
  const hits = times.flatMap((time, index) => {
    const text = readings[index]?.text ?? "";
    return text === "" ? [] : [{ time, text }];
  });
  database.transaction(() => {
    for (const hit of hits) insert.run(hit.time, hit.text);
  })();
  console.log(`${hits.length} samples had Chinese text:`);
  for (const hit of hits) console.log(`  ${hit.time.toFixed(1)}s  ${hit.text}`);
}
