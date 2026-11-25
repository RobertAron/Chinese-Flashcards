import { openDatabase } from "../db";
import { run } from "../media";
import { loadProject, videoPath } from "../project";

const toSeconds = (timestamp: string) =>
  timestamp
    .trim()
    .split(":")
    .reduce((total, part) => total * 60 + Number(part), 0);

/** Parses the [Events] section of an ASS file (ffmpeg converts SRT and other text subtitles to ASS). */
export function parseAss(ass: string) {
  const lines = ass.split(/\r?\n/);
  const eventsStart = lines.findIndex((line) => line.trim() === "[Events]");
  const format = lines
    .slice(eventsStart)
    .find((line) => line.startsWith("Format:"))
    ?.slice("Format:".length)
    .split(",")
    .map((field) => field.trim());
  if (format === undefined) throw new Error("No [Events] Format line in the subtitles");
  const [startIndex, endIndex, textIndex] = ["Start", "End", "Text"].map((field) => format.indexOf(field));
  return lines
    .slice(eventsStart)
    .filter((line) => line.startsWith("Dialogue:"))
    .map((line) => {
      const fields = line.slice("Dialogue:".length).split(",");
      const text = fields
        .slice(textIndex)
        .join(",")
        .replace(/\{[^}]*\}/g, "")
        .replace(/\\[Nnh]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { start: toSeconds(fields[startIndex!]!), end: toSeconds(fields[endIndex!]!), english: text };
    })
    .filter((cue) => cue.english !== "")
    .sort((a, b) => a.start - b.start);
}

/** Reads the timed subtitle stream into the cues table. */
export async function extractCues(folder: string) {
  const project = await loadProject(folder);
  const database = openDatabase(project);
  const phraseCount = database.query<{ count: number }, []>("SELECT count(*) AS count FROM phrases").get();
  if ((phraseCount?.count ?? 0) > 0)
    throw new Error("Phrases already exist; refusing to replace their cues.");
  const ass = await run([
    ...["ffmpeg", "-v", "error", "-i", videoPath(project)],
    ...["-map", `0:s:${project.config.subtitleStream}`, "-f", "ass", "pipe:1"],
  ]);
  const cues = parseAss(ass);
  database.transaction(() => {
    database.run("DELETE FROM cues");
    const insert = database.prepare("INSERT INTO cues (id, start, end, english) VALUES (?, ?, ?, ?)");
    for (const [index, cue] of cues.entries()) insert.run(index + 1, cue.start, cue.end, cue.english);
  })();
  console.log(`Saved ${cues.length} cues.`);
}
