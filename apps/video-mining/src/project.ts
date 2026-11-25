import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import z from "zod";

const rectangle = z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() });

/** project.json: everything the pipeline needs to know about one video. Paths are relative to the project folder. */
export const projectConfigSchema = z.object({
  /** The video file, relative to the project folder. */
  video: z.string(),
  /** Source resolution in pixels. */
  width: z.number(),
  height: z.number(),
  /** True for PQ/HLG sources; frames are tone-mapped to SDR BT.709. */
  hdr: z.boolean(),
  /** Which subtitle stream holds the timed cues (ffmpeg `0:s:N`). */
  subtitleStream: z.number().int().default(0),
  /** Which audio stream to cut clips from (ffmpeg `0:a:N`). */
  audioStream: z.number().int().default(0),
  /** ffmpeg pan channel for clips, e.g. "FC" for the 5.1 centre (dialogue) channel, or "downmix" for stereo. */
  audioChannel: z.string().default("FC"),
  /** Where the burned-in subtitles sit, in source pixels. OCR reads this rectangle. */
  subtitleBand: rectangle,
  /** The rows card images may use (above the burned-in subtitles), in source pixels. Cards are squares of this height. */
  imageArea: z.object({ y: z.number(), height: z.number() }),
  /** Character and place names. They count as level 0 and are never split. */
  names: z.string().array().default([]),
  /**
   * Words this video treats as HSK 1 whatever their real level, so phrases built around them land in the
   * beginner levels (师父 in Legend of Hei, used almost as a name). Affects phrase levels only, not the
   * study app's Words.
   */
  countAsHsk1: z.string().array().default([]),
  /** Seconds of audio to keep around each phrase's cues when cutting clips (clamped to the neighbouring cues). */
  clipPadding: z.object({ before: z.number(), after: z.number() }).default({ before: 0.4, after: 0.6 }),
  /** How many candidate frames to save per phrase. */
  framesPerPhrase: z.number().int().default(4),
});
export type ProjectConfig = z.output<typeof projectConfigSchema>;

export type Project = ReturnType<typeof projectPaths> & { config: ProjectConfig };

/** Every file the pipeline reads or writes inside a project folder. */
export const projectPaths = (folder: string) => {
  const root = resolve(folder);
  return {
    root,
    configFile: join(root, "project.json"),
    database: join(root, "review.db"),
    audioFolder: join(root, "audio"),
    framesFolder: join(root, "frames"),
    annotationsFolder: join(root, "annotations"),
    workFolder: join(root, "work"),
  };
};

export const audioPath = (project: Project, phraseId: number) => join(project.audioFolder, `${phraseId}.mp3`);
export const framePath = (project: Project, phraseId: number, index: number | "%d") =>
  join(project.framesFolder, `${phraseId}-${index}.jpg`);
export const videoPath = (project: Project) => join(project.root, project.config.video);

export async function loadProject(folder: string): Promise<Project> {
  const paths = projectPaths(folder);
  if (!existsSync(paths.configFile)) throw new Error(`No project.json in ${paths.root}. Run \`init\` first.`);
  const config = projectConfigSchema.parse(JSON.parse(await readFile(paths.configFile, "utf8")));
  await Promise.all(
    [paths.audioFolder, paths.framesFolder, paths.annotationsFolder, paths.workFolder].map((path) =>
      mkdir(path, { recursive: true }),
    ),
  );
  return { ...paths, config };
}

export const saveProjectConfig = (folder: string, config: ProjectConfig) =>
  writeFile(projectPaths(folder).configFile, `${JSON.stringify(config, null, 2)}\n`);
