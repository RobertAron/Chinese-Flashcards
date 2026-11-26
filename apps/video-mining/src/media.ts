import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Project } from "./project";
import { videoPath } from "./project";

/** Runs `work` over `items` with at most `concurrency` in flight, printing progress every `reportEvery` items. */
export async function runPool<Item>(
  items: readonly Item[],
  concurrency: number,
  work: (item: Item) => Promise<void>,
  label = "items",
  reportEvery = 100,
) {
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++] as Item;
      await work(item);
      done++;
      if (done % reportEvery === 0 || done === items.length)
        console.log(`  ${done}/${items.length} ${label}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

export async function run(command: string[]) {
  const child = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if (exitCode !== 0) throw new Error(`${command[0]} exited with ${exitCode}: ${stderr.trim().slice(-800)}`);
  return stdout;
}

/** Converts HDR (PQ, BT.2020) frames to SDR BT.709 with ffmpeg 8's colour-managed scaler. */
const toneMap = (project: Project) =>
  project.config.hdr ? ":out_transfer=bt709:out_primaries=bt709:out_color_matrix=bt709:out_range=pc" : "";

/** Saves one video frame at `time`, cropped to a source-pixel rectangle and scaled to `outputHeight`. */
export function grabFrame(
  project: Project,
  time: number,
  crop: { x: number; y: number; width: number; height: number },
  outputPath: string,
  outputHeight = crop.height,
) {
  return run([
    "ffmpeg",
    ...[
      "-v",
      "error",
      "-y",
      "-ss",
      time.toFixed(3),
      "-i",
      videoPath(project),
      "-frames:v",
      "1",
      "-update",
      "1",
    ],
    ...[
      "-vf",
      `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},scale=-2:${outputHeight}${toneMap(project)}`,
    ],
    ...["-q:v", "3", outputPath],
  ]);
}

/**
 * Saves `count` frames `interval` seconds apart starting at `firstTime`, in one decoding pass (much faster
 * than one seek per frame). `outputPattern` contains `%d`, numbered from 0.
 */
export function grabFrameSeries(
  project: Project,
  { firstTime, interval, count }: { firstTime: number; interval: number; count: number },
  crop: { x: number; y: number; width: number; height: number },
  outputPattern: string,
  outputHeight = crop.height,
) {
  const crops = `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`;
  return run([
    ...["ffmpeg", "-v", "error", "-y", "-ss", firstTime.toFixed(3), "-i", videoPath(project)],
    ...["-vf", `fps=1/${interval.toFixed(4)},${crops},scale=-2:${outputHeight}${toneMap(project)}`],
    ...["-frames:v", String(count), "-start_number", "0", "-q:v", "3", outputPattern],
  ]);
}

/** Cuts [start, end)of the configured audio channel to a mono MP3. */
export function cutAudio(project: Project, start: number, end: number, outputPath: string) {
  const { audioStream, audioChannel } = project.config;
  const channelFilter = audioChannel === "downmix" ? ["-ac", "1"] : ["-af", `pan=mono|c0=${audioChannel}`];
  return run([
    "ffmpeg",
    ...[
      "-v",
      "error",
      "-y",
      "-ss",
      start.toFixed(3),
      "-t",
      (end - start).toFixed(3),
      "-i",
      videoPath(project),
    ],
    ...["-map", `0:a:${audioStream}`, ...channelFilter, "-c:a", "libmp3lame", "-q:a", "2", outputPath],
  ]);
}

const visionBinary = fileURLToPath(new URL("../bin/vision", import.meta.url));
const visionSource = fileURLToPath(new URL("../swift/vision.swift", import.meta.url));

/** Builds bin/vision when it's missing or older than its source. */
async function ensureHelper() {
  const isStale =
    !existsSync(visionBinary) || statSync(visionSource).mtimeMs > statSync(visionBinary).mtimeMs;
  if (isStale) await run(["swiftc", "-O", visionSource, "-o", visionBinary]);
}

/**
 * Runs the Swift helper over many input lines, split across `concurrency` processes. Results come back in
 * input order (each process takes a contiguous chunk).
 */
async function runHelper<Result>(
  mode: "ocr" | "saliency" | "tokenize" | "pinyin",
  inputs: readonly string[],
  concurrency = 4,
): Promise<Result[]> {
  await ensureHelper();
  const chunkSize = Math.ceil(inputs.length / concurrency);
  const chunks = Array.from({ length: concurrency }, (_, index) =>
    inputs.slice(index * chunkSize, (index + 1) * chunkSize),
  ).filter((chunk) => chunk.length > 0);
  const outputs = await Promise.all(
    chunks.map(async (chunk) => {
      const child = Bun.spawn([visionBinary, mode], { stdin: "pipe", stdout: "pipe", stderr: "inherit" });
      child.stdin.write(`${chunk.join("\n")}\n`);
      child.stdin.end();
      const text = await new Response(child.stdout).text();
      if ((await child.exited) !== 0) throw new Error(`vision ${mode} failed`);
      return text;
    }),
  );
  return outputs
    .flatMap((text) => text.split("\n"))
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as Result);
}

/** Runs Apple Vision OCR or saliency over many images, keyed by path. */
export async function runVision<Result extends { path: string }>(
  mode: "ocr" | "saliency",
  paths: readonly string[],
): Promise<Map<string, Result>> {
  const results = await runHelper<Result>(mode, paths);
  return new Map(results.map((result) => [result.path, result]));
}

/** Apple's word tokenizer (NaturalLanguage) over many texts; one token list per text, in order. */
export async function tokenize(texts: readonly string[]): Promise<string[][]> {
  const lines = texts.map((text) => text.replace(/\s+/g, " ").trim() || "。");
  const results = await runHelper<{ text: string; tokens: string[] }>(
    "tokenize",
    lines,
    lines.length > 200 ? 4 : 1,
  );
  return results.map((result) => result.tokens);
}

/** Pinyin syllables (tone marks, lower case) for each text, from macOS's Mandarin-to-Latin transliteration. */
export async function transliterate(texts: readonly string[]): Promise<string[][]> {
  if (texts.length === 0) return [];
  const results = await runHelper<{ text: string; syllables: string[] }>("pinyin", texts, 1);
  return results.map((result) => result.syllables);
}

export type OcrResult = { path: string; lines: { text: string; confidence: number; box: number[] }[] };
export type SaliencyResult = { path: string; boxes: { box: number[]; confidence: number }[] };
