import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import z from "zod";
import type { FrameRow, PhraseRow, WordReadingRow } from "../db";
import { openDatabase, phraseStatuses } from "../db";
import { forgetStudyWords, joinWords, loadDictionary, splitWords } from "../dictionary";
import { audioPath, loadProject, saveProjectConfig } from "../project";
import { relevelPhrases } from "../steps/segment";
import { addStudyWord, suggestStudyWords } from "../study";
import index from "./index.html";
import type { MissingWord, PhraseView, ProjectView } from "./types";

const folder = Bun.argv[2];
if (folder === undefined) {
  console.log("Usage: bun run review <project folder> [--port 4300]");
  process.exit(1);
}
const portFlag = Bun.argv.indexOf("--port");
const port = portFlag === -1 ? 4300 : Number(Bun.argv[portFlag + 1]);

const project = await loadProject(folder);
const database = openDatabase(project);
// Reloaded when project.json's word lists change or words are added to the study app.
let dictionary = await loadDictionary(project.config);

const framesByPhrase = () =>
  Map.groupBy(
    database.query<FrameRow, []>("SELECT * FROM frames ORDER BY phrase_id, idx").all(),
    (frame) => frame.phrase_id,
  );
const readingsByPhrase = () =>
  Map.groupBy(
    database.query<WordReadingRow, []>("SELECT * FROM word_readings").all(),
    (reading) => reading.phrase_id,
  );

const toView = (phrase: PhraseRow, frames: FrameRow[], readings: WordReadingRow[]): PhraseView => ({
  ...phrase,
  frames: frames.map(({ idx, time, saliency_x }) => ({ index: idx, time, saliencyX: saliency_x })),
  wordInfo: splitWords(phrase.words ?? "").map((word, position) => {
    const info = dictionary.describe(word);
    const picked = readings.find((reading) => reading.position === position)?.study_word_id;
    return { ...info, readingId: picked ?? info.readings[0]?.id ?? null };
  }),
});

const getPhrase = (id: number) => {
  const phrase = database.query<PhraseRow, [number]>("SELECT * FROM phrases WHERE id = ?").get(id);
  if (phrase === null) return null;
  const frames = database
    .query<FrameRow, [number]>("SELECT * FROM frames WHERE phrase_id = ? ORDER BY idx")
    .all(id);
  const readings = database
    .query<WordReadingRow, [number]>("SELECT * FROM word_readings WHERE phrase_id = ?")
    .all(id);
  return toView(phrase, frames, readings);
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
    /** Which study-app reading the word at `position` uses. */
    reading: z.object({ position: z.number().int().min(0), studyWordId: z.number().int() }),
  })
  .partial();

const withoutSpaces = (text: string) => text.replace(/\s+/g, "");
const badRequest = (error: string | undefined) => Response.json({ error }, { status: 400 });

async function updatePhrase(id: number, body: unknown) {
  const current = getPhrase(id);
  if (current === null) return Response.json({ error: "Not found" }, { status: 404 });
  const parsed = phrasePatch.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);
  const { reading, ...columns } = parsed.data;
  const patch: Record<string, unknown> = { ...columns };
  const chinese = parsed.data.chinese ?? current.chinese;
  if (parsed.data.words !== undefined || parsed.data.chinese !== undefined) {
    const words = parsed.data.words
      ? splitWords(parsed.data.words)
      : ((await dictionary.segmentMany([chinese]))[0] ?? []);
    if (withoutSpaces(words.join("")) !== withoutSpaces(chinese)) {
      return badRequest("The words must spell out the Chinese text exactly");
    }
    patch.words = joinWords(words);
    patch.hsk_level = dictionary.phraseLevel(words);
    // Positions refer to the old split.
    database.run("DELETE FROM word_readings WHERE phrase_id = ?", [id]);
  }
  if (reading !== undefined) {
    const word = current.wordInfo[reading.position];
    if (word?.readings.every((option) => option.id !== reading.studyWordId) ?? true) {
      return badRequest("That reading isn't one of the study app's readings for this word");
    }
    // The most frequent reading is the default, so picking it just clears the choice.
    if (word.readings[0]?.id === reading.studyWordId) {
      database.run("DELETE FROM word_readings WHERE phrase_id = ? AND position = ?", [id, reading.position]);
    } else {
      database.run(
        "INSERT INTO word_readings (phrase_id, position, study_word_id) VALUES (?, ?, ?) ON CONFLICT (phrase_id, position) DO UPDATE SET study_word_id = excluded.study_word_id",
        [id, reading.position, reading.studyWordId],
      );
    }
  }
  const names = Object.keys(patch);
  if (names.length > 0 || reading !== undefined) {
    database
      .prepare(
        `UPDATE phrases SET ${[...names.map((column) => `${column} = ?`), "updated_at = CURRENT_TIMESTAMP"].join(", ")} WHERE id = ?`,
      )
      .run(...(Object.values(patch) as (string | number | null)[]), id);
  }
  return Response.json(getPhrase(id));
}

const wordListChange = z.object({
  list: z.enum(["names", "countAsHsk1"]),
  word: z.string().trim().nonempty(),
  included: z.boolean(),
});

/** Adds a word to one of project.json's word lists or removes it, then re-levels every phrase. */
async function setWordList(body: unknown) {
  const parsed = wordListChange.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);
  const { list, word, included } = parsed.data;
  // Re-read project.json so edits made while the server runs (by hand or by other steps) aren't overwritten.
  const { config } = await loadProject(project.root);
  const others = config[list].filter((existing) => existing !== word);
  project.config = { ...config, [list]: included ? [...others, word] : others };
  await saveProjectConfig(project.root, project.config);
  dictionary = await loadDictionary(project.config);
  const changed = relevelPhrases(database, dictionary);
  return Response.json({ ...projectView(), changed });
}

/** Words in approved or pending phrases that the study app doesn't have, with suggested Words fields. */
async function missingWords(): Promise<MissingWord[]> {
  const phrases = database
    .query<Pick<PhraseRow, "id" | "chinese" | "words" | "status">, []>(
      "SELECT id, chinese, words, status FROM phrases WHERE status IN ('approved', 'pending') AND words IS NOT NULL ORDER BY start",
    )
    .all();
  const users = new Map<string, typeof phrases>();
  for (const phrase of phrases) {
    for (const word of new Set(splitWords(phrase.words ?? ""))) {
      if (dictionary.describe(word).inStudyApp) continue;
      users.set(word, [...(users.get(word) ?? []), phrase]);
    }
  }
  const words = [...users.keys()].map(dictionary.describe);
  const suggestions = await suggestStudyWords(words);
  return words
    .map((word, index) => {
      const using = users.get(word.characters) ?? [];
      const approved = using.filter((phrase) => phrase.status === "approved");
      return {
        characters: word.characters,
        isName: word.kind === "name",
        approvedPhrases: approved.length,
        pendingPhrases: using.length - approved.length,
        example: (approved[0] ?? using[0])?.chinese ?? "",
        ...suggestions[index]!,
      };
    })
    .sort((a, b) => b.approvedPhrases - a.approvedPhrases || b.pendingPhrases - a.pendingPhrases);
}

const newStudyWord = z.object({
  characters: z.string().trim().nonempty(),
  pinyin: z.string().trim().nonempty(),
  meaning: z.string().trim(),
  hskLevel: z.number().int().min(1).max(7).nullable(),
});

async function addWord(body: unknown) {
  const parsed = newStudyWord.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message);
  try {
    const id = await addStudyWord(parsed.data);
    forgetStudyWords();
    dictionary = await loadDictionary(project.config);
    relevelPhrases(database, dictionary);
    return Response.json({ id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

const projectView = (): ProjectView => ({
  name: basename(project.root),
  width: project.config.width,
  imageArea: project.config.imageArea,
  framesPerPhrase: project.config.framesPerPhrase,
  names: project.config.names,
  countAsHsk1: project.config.countAsHsk1,
});

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
    "/api/project": () => Response.json(projectView()),
    "/api/word-lists": {
      PUT: async (request) => setWordList(await request.json()),
    },
    "/api/missing-words": async () => Response.json(await missingWords()),
    "/api/study-words": {
      POST: async (request) => addWord(await request.json()),
    },
    "/api/phrases": () => {
      const frames = framesByPhrase();
      const readings = readingsByPhrase();
      const phrases = database.query<PhraseRow, []>("SELECT * FROM phrases ORDER BY start").all();
      return Response.json(
        phrases.map((phrase) => toView(phrase, frames.get(phrase.id) ?? [], readings.get(phrase.id) ?? [])),
      );
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
