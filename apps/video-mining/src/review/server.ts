import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import z from "zod";
import type { FrameRow, PhraseRow } from "../db";
import { openDatabase, phraseStatuses } from "../db";
import { joinWords, loadDictionary, splitWords } from "../dictionary";
import { audioPath, loadProject, saveProjectConfig } from "../project";
import { relevelPhrases } from "../steps/segment";
import index from "./index.html";
import type { PhraseView, ProjectView } from "./types";

const folder = Bun.argv[2];
if (folder === undefined) {
  console.log("Usage: bun run review <project folder> [--port 4300]");
  process.exit(1);
}
const portFlag = Bun.argv.indexOf("--port");
const port = portFlag === -1 ? 4300 : Number(Bun.argv[portFlag + 1]);

const project = await loadProject(folder);
const database = openDatabase(project);
// Reloaded when the countAsHsk1 list changes.
let dictionary = await loadDictionary(project.config);

const framesByPhrase = () =>
  Map.groupBy(
    database.query<FrameRow, []>("SELECT * FROM frames ORDER BY phrase_id, idx").all(),
    (frame) => frame.phrase_id,
  );

const toView = (phrase: PhraseRow, frames: FrameRow[]): PhraseView => ({
  ...phrase,
  frames: frames.map(({ idx, time, saliency_x }) => ({ index: idx, time, saliencyX: saliency_x })),
  wordInfo: splitWords(phrase.words ?? "").map(dictionary.describe),
});

const getPhrase = (id: number) => {
  const phrase = database.query<PhraseRow, [number]>("SELECT * FROM phrases WHERE id = ?").get(id);
  if (phrase === null) return null;
  const frames = database
    .query<FrameRow, [number]>("SELECT * FROM frames WHERE phrase_id = ? ORDER BY idx")
    .all(id);
  return toView(phrase, frames);
};

const optionalSeconds = z.number().min(0).nullable().optional();
const phrasePatch = z
  .object({
    status: z.enum(phraseStatuses),
    chinese: z.string().trim().nonempty(),
    meaning: z.string().trim().nonempty(),
    /** Space-separated words, or null to split the Chinese automatically. */
    words: z.string().trim().nonempty().nullable(),
    trim_start: optionalSeconds,
    trim_end: optionalSeconds,
    frame: z.number().int().min(0),
    crop_x: z.number().min(0).max(1).nullable(),
    note: z.string().nullable(),
  })
  .partial();

const withoutSpaces = (text: string) => text.replace(/\s+/g, "");

async function updatePhrase(id: number, body: unknown) {
  const current = getPhrase(id);
  if (current === null) return Response.json({ error: "Not found" }, { status: 404 });
  const parsed = phrasePatch.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const patch: Record<string, unknown> = { ...parsed.data };
  const chinese = parsed.data.chinese ?? current.chinese;
  if (parsed.data.words !== undefined || parsed.data.chinese !== undefined) {
    const words = parsed.data.words
      ? splitWords(parsed.data.words)
      : ((await dictionary.segmentMany([chinese]))[0] ?? []);
    if (withoutSpaces(words.join("")) !== withoutSpaces(chinese)) {
      return Response.json({ error: "The words must spell out the Chinese text exactly" }, { status: 400 });
    }
    patch.words = joinWords(words);
    patch.hsk_level = dictionary.phraseLevel(words);
  }
  const columns = Object.keys(patch);
  if (columns.length > 0) {
    database
      .prepare(
        `UPDATE phrases SET ${columns.map((column) => `${column} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      )
      .run(...(Object.values(patch) as (string | number | null)[]), id);
  }
  return Response.json(getPhrase(id));
}

const countAsHsk1Change = z.object({ word: z.string().trim().nonempty(), counted: z.boolean() });

/** Adds a word to project.json's countAsHsk1 list or removes it, then re-levels every phrase. */
async function setCountAsHsk1(body: unknown) {
  const parsed = countAsHsk1Change.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { word, counted } = parsed.data;
  const others = project.config.countAsHsk1.filter((existing) => existing !== word);
  project.config = { ...project.config, countAsHsk1: counted ? [...others, word] : others };
  await saveProjectConfig(project.root, project.config);
  dictionary = await loadDictionary(project.config);
  const changed = relevelPhrases(database, dictionary);
  return Response.json({ countAsHsk1: project.config.countAsHsk1, changed });
}

/** Serves a file with HTTP Range support, so the browser can seek inside audio clips. */
function serveFile(path: string, request: Request) {
  if (!existsSync(path)) return new Response("Not found", { status: 404 });
  const file = Bun.file(path);
  const range = request.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (!range)
    return new Response(file, { headers: { "Accept-Ranges": "bytes", "Cache-Control": "no-cache" } });
  const start = range[1] ? Number(range[1]) : 0;
  const end = range[2] ? Math.min(Number(range[2]), file.size - 1) : file.size - 1;
  return new Response(file.slice(start, end + 1), {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${file.size}`,
      "Content-Type": file.type,
      "Cache-Control": "no-cache",
    },
  });
}

const server = Bun.serve({
  port,
  development: true,
  routes: {
    "/": index,
    "/api/project": () => {
      const view: ProjectView = {
        name: basename(project.root),
        width: project.config.width,
        imageArea: project.config.imageArea,
        framesPerPhrase: project.config.framesPerPhrase,
        countAsHsk1: project.config.countAsHsk1,
      };
      return Response.json(view);
    },
    "/api/count-as-hsk1": {
      PUT: async (request) => setCountAsHsk1(await request.json()),
    },
    "/api/phrases": () => {
      const frames = framesByPhrase();
      const phrases = database.query<PhraseRow, []>("SELECT * FROM phrases ORDER BY start").all();
      return Response.json(phrases.map((phrase) => toView(phrase, frames.get(phrase.id) ?? [])));
    },
    "/api/phrases/:id": {
      PATCH: async (request) => updatePhrase(Number(request.params.id), await request.json()),
    },
    "/media/audio/:file": (request) =>
      serveFile(audioPath(project, Number.parseInt(request.params.file, 10)), request),
    "/media/frames/:file": (request) =>
      serveFile(join(project.framesFolder, basename(request.params.file)), request),
  },
});

console.log(`Reviewing ${project.root} at ${server.url}`);
