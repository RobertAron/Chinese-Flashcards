import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Image, type S3Client } from "bun";
import { type FrameRow, openDatabase, type PhraseRow, type StudyPhraseRow, type WordReadingRow } from "../db";
import { type Dictionary, loadDictionary, offListLevel, splitWords, studyDatabasePath } from "../dictionary";
import { run, runPool } from "../media";
import { audioPath, framePath, loadProject, type Project } from "../project";
import { studyBucket } from "../study";

/** Phrases per "Scenes" drill and scenes per lesson, as in the first film's courses. */
const beginnerScene = 4;
const advancedScene = 5;
const scenesPerLesson = 5;
/** Card images are squares this size. */
const imageSize = 768;

type StudyWord = { id: number; characters: string; pinyin: string; meaning: string };
type ReviewedPhrase = PhraseRow & { pieces: string[]; level: number };
/** With the study-app Words id of each piece: the reading picked in review, or the most frequent one. */
type ApprovedPhrase = ReviewedPhrase & { wordIds: number[] };
type DrillPlan = { slug: string; title: string; phrases: ApprovedPhrase[]; wordIds: number[] };
type LessonPlan = { slug: string; title: string; drills: DrillPlan[] };
type CoursePlan = { slug: string; title: string; lessons: LessonPlan[] };

const chunk = <Item>(items: readonly Item[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
const filmTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const levelLessons = (level: number) =>
  level >= offListLevel
    ? { slug: "extra", title: "Off the HSK list" }
    : level === 7
      ? { slug: "hsk7", title: "HSK 7–9" }
      : { slug: `hsk${level}`, title: `HSK ${level}` };

/**
 * Copies the approved phrases into the study app: Phrases and PhraseWords rows in apps/db/local.db, audio and
 * card images on R2, and two courses laid out like the first film's. Safe to re-run: phrases already copied
 * are updated in place, media is re-uploaded only when the trim, frame or crop changed, and the two courses'
 * lessons and drills are rebuilt from scratch each time (study progress is per word and phrase, not per drill).
 *
 * Never creates Words. Every word in an approved phrase must already be in the study app, or nothing happens.
 */
export async function importPhrases(folder: string, { dryRun = false } = {}) {
  const project = await loadProject(folder);
  const course = project.config.course;
  if (course === undefined) return fail('Set "course" (slug, title, advancedTitle) in project.json first.');
  const review = openDatabase(project);
  const dictionary = await loadDictionary(project.config);
  const study = new Database(studyDatabasePath, { readonly: dryRun });

  const reviewed: ReviewedPhrase[] = review
    .query<PhraseRow, []>("SELECT * FROM phrases WHERE status = 'approved' ORDER BY start")
    .all()
    .map((phrase) => ({
      ...phrase,
      pieces: splitWords(phrase.words ?? ""),
      level: Math.max(1, phrase.hsk_level ?? offListLevel),
    }));

  // 1. Every word must already be in the study app. Stop before touching anything if one isn't.
  const lookUp = study.query<StudyWord, [string]>(
    "SELECT id, characters, pinyin, meaning FROM Words WHERE characters = ? ORDER BY frequencyRank, id",
  );
  const readings = new Map(
    [...new Set(reviewed.flatMap((phrase) => phrase.pieces))].map((word) => [word, lookUp.all(word)]),
  );
  const missing = [...readings].filter(([, rows]) => rows.length === 0).map(([word]) => word);
  if (missing.length > 0) return fail(missingWordsMessage(missing, reviewed, dictionary));
  const picked = Map.groupBy(
    review.query<WordReadingRow, []>("SELECT * FROM word_readings").all(),
    (reading) => reading.phrase_id,
  );
  const approved: ApprovedPhrase[] = reviewed.map((phrase) => ({
    ...phrase,
    wordIds: phrase.pieces.map((word, position) => {
      const options = readings.get(word) ?? [];
      const choice = picked.get(phrase.id)?.find((reading) => reading.position === position)?.study_word_id;
      return (options.find((option) => option.id === choice) ?? options[0]!).id;
    }),
  }));
  const wordById = new Map([...readings.values()].flat().map((word) => [word.id, word]));
  warnAboutReadings(readings, approved);

  // 2. Media files must exist, and the frames' saliency is needed for the crop.
  const frames = Map.groupBy(
    review.query<FrameRow, []>("SELECT * FROM frames").all(),
    (frame) => frame.phrase_id,
  );
  const unrenderable = approved.filter(
    (phrase) =>
      !existsSync(audioPath(project, phrase.id)) ||
      !existsSync(framePath(project, phrase.id, phrase.frame ?? 0)),
  );
  if (unrenderable.length > 0) {
    return fail(
      `Missing audio or frames for phrases ${unrenderable.map((phrase) => phrase.id).join(", ")}. Run \`media\` first.`,
    );
  }

  const links = new Map(
    review
      .query<StudyPhraseRow, []>("SELECT * FROM study_phrases")
      .all()
      .map((link) => [link.phrase_id, link]),
  );
  const existsInStudy = study.query<{ id: number }, [number]>("SELECT id FROM Phrases WHERE id = ?");
  const isLinked = (phrase: ApprovedPhrase) => {
    const link = links.get(phrase.id);
    return link !== undefined && existsInStudy.get(link.study_id) !== null;
  };
  const media = (phrase: ApprovedPhrase) => mediaKey(phrase, frames.get(phrase.id) ?? []);
  const toUpload = approved.filter(
    (phrase) => !isLinked(phrase) || links.get(phrase.id)?.media !== media(phrase),
  );
  const plan = layoutCourses(course, approved, dictionary);
  const unapproved = [...links.values()].filter(
    (link) => !approved.some((phrase) => phrase.id === link.phrase_id),
  );

  console.log(
    [
      `${approved.length} approved phrases: ${approved.filter((phrase) => !isLinked(phrase)).length} new, ${approved.filter(isLinked).length} already in the study app.`,
      `${toUpload.length} need their audio and image uploaded.`,
      ...plan.map(
        (coursePlan) =>
          `${coursePlan.title} (${coursePlan.slug}): ${coursePlan.lessons.length} lessons, ${coursePlan.lessons.flatMap((lesson) => lesson.drills).length} drills.`,
      ),
      ...(unapproved.length > 0
        ? [
            `${unapproved.length} phrases copied earlier are no longer approved. They stay in the study app but leave every drill (study ids ${unapproved.map((link) => link.study_id).join(", ")}).`,
          ]
        : []),
    ].join("\n"),
  );
  if (dryRun) {
    for (const coursePlan of plan) {
      console.log(`\n${coursePlan.title}`);
      for (const lesson of coursePlan.lessons) {
        console.log(`  ${lesson.title}`);
        for (const drill of lesson.drills) {
          console.log(
            `    ${drill.title}: ${drill.phrases.map((phrase) => phrase.chinese).join(" ") || drill.wordIds.map((id) => wordById.get(id)?.characters).join(" ")}`,
          );
        }
      }
    }
    console.log("\nDry run: nothing was written or uploaded.");
    return;
  }
  let r2: S3Client;
  try {
    r2 = studyBucket();
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }

  // 3. Render media first, so a failure leaves the study app untouched.
  const renderFolder = join(project.workFolder, "import");
  await mkdir(renderFolder, { recursive: true });
  await runPool(
    toUpload,
    4,
    (phrase) => renderMedia(project, phrase, frames.get(phrase.id) ?? [], renderFolder),
    "rendered",
    25,
  );

  // 4. Phrases, then the course layout, in one transaction.
  const studyIds = writeStudyPhrases(study, review, approved, links, isLinked);
  writeLayout(study, course.slug, plan, studyIds);

  // 5. Upload, and remember what was uploaded so unchanged media is skipped next time.
  const recordMedia = review.prepare("UPDATE study_phrases SET media = ? WHERE phrase_id = ?");
  await runPool(
    toUpload,
    8,
    async (phrase) => {
      const studyId = studyIds.get(phrase.id)!;
      await r2.write(`phrases/${studyId}.mp3`, Bun.file(join(renderFolder, `${phrase.id}.mp3`)), {
        type: "audio/mpeg",
      });
      await r2.write(`phrases/${studyId}.webp`, Bun.file(join(renderFolder, `${phrase.id}.webp`)), {
        type: "image/webp",
      });
      recordMedia.run(media(phrase), phrase.id);
    },
    "uploaded",
    25,
  );
  console.log(`Done. Uploaded media for ${toUpload.length} phrases.`);
}

function fail(message: string) {
  console.error(message);
  process.exitCode = 1;
}

function missingWordsMessage(missing: string[], approved: ReviewedPhrase[], dictionary: Dictionary) {
  const lines = missing.map((word) => {
    const info = dictionary.describe(word);
    const users = approved.filter((phrase) => phrase.pieces.includes(word));
    const details = [
      info.pinyin[0] ?? "no pinyin",
      info.kind === "name"
        ? "name"
        : info.dictionaryLevel === null
          ? "no HSK level"
          : `HSK ${info.dictionaryLevel}`,
      info.meaning,
    ].filter(Boolean);
    return `  ${word}  ${details.join(" · ")}  (${users.length} phrase${users.length === 1 ? "" : "s"}, e.g. #${users[0]?.id} ${users[0]?.chinese})`;
  });
  return [
    `Not importing: ${missing.length} word${missing.length === 1 ? " isn't" : "s aren't"} in the study app's dictionary (its Words table):`,
    ...lines,
    'Add them with "Missing from study app" in the review app (or by hand: a Words row and words/<id>.mp3 audio), then run import again. Nothing was changed.',
  ].join("\n");
}

/** Says how many phrases use each reading of words with several (还 hái/huán), so a wrong default stands out. */
function warnAboutReadings(readings: Map<string, StudyWord[]>, approved: ApprovedPhrase[]) {
  for (const [word, rows] of readings) {
    if (rows.length < 2) continue;
    const uses = rows.map(
      (row) =>
        `${row.pinyin} "${row.meaning}" in ${approved.filter((phrase) => phrase.wordIds.includes(row.id)).length}`,
    );
    console.warn(
      `Note: ${word} has ${rows.length} readings: ${uses.join("; ")}. Pick another in the review app.`,
    );
  }
}

/** The inputs of a phrase's uploaded audio and image. When it changes, they're rendered and uploaded again. */
function mediaKey(phrase: PhraseRow, frames: FrameRow[]) {
  const frame = phrase.frame ?? 0;
  const crop = phrase.crop_x ?? frames.find((candidate) => candidate.idx === frame)?.saliency_x ?? 0.5;
  return JSON.stringify({ trim: [phrase.trim_start, phrase.trim_end], frame, crop });
}

async function renderMedia(project: Project, phrase: PhraseRow, frames: FrameRow[], folder: string) {
  const { frame, crop } = JSON.parse(mediaKey(phrase, frames)) as { frame: number; crop: number };
  const audioOut = join(folder, `${phrase.id}.mp3`);
  if (phrase.trim_start === null && phrase.trim_end === null) {
    await Bun.write(audioOut, Bun.file(audioPath(project, phrase.id)));
  } else {
    // Same cut as the study app's admin trim: atrim inside the filter chain, then short fades so it doesn't click.
    const start = phrase.trim_start ?? 0;
    const clipLength = (phrase.clip_end ?? 0) - (phrase.clip_start ?? 0);
    const end = phrase.trim_end ?? clipLength;
    const fade = Math.min(0.03, (end - start) / 4);
    await run([
      "ffmpeg",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      audioPath(project, phrase.id),
      "-af",
      `atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${end - start - fade}:d=${fade}`,
      "-c:a",
      "libmp3lame",
      "-q:a",
      "2",
      audioOut,
    ]);
  }
  // ffmpeg cuts the square (its WebP encoder isn't always built in); Bun encodes the WebP like the admin page does.
  const source = framePath(project, phrase.id, frame);
  const metadata = await new Image(await Bun.file(source).bytes()).metadata();
  const side = metadata.height;
  const x = Math.round((metadata.width - side) * crop);
  const squarePath = join(folder, `${phrase.id}.png`);
  await run([
    "ffmpeg",
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    source,
    "-vf",
    `crop=${side}:${side}:${x}:0`,
    "-update",
    "1",
    squarePath,
  ]);
  const square = Bun.file(squarePath);
  const webp = await new Image(await square.bytes())
    .resize(imageSize, imageSize, { filter: "mitchell" })
    .webp({ quality: 75 })
    .bytes();
  await Bun.write(join(folder, `${phrase.id}.webp`), webp);
  await square.delete();
}

/**
 * The first film's layout. HSK 1 phrases (level 0–1) go in the main course: lessons of 5 scenes of 4 phrases
 * in film order, each scene preceded by a drill of its words not taught earlier in the course. Everything else
 * goes in `<slug>-advanced`, one run of lessons per level (5 scenes of 5 phrases), each lesson starting with
 * the words at its own level that the course hasn't taught yet.
 */
function layoutCourses(
  course: NonNullable<Project["config"]["course"]>,
  approved: ApprovedPhrase[],
  dictionary: Dictionary,
): CoursePlan[] {
  const taught = new Set<number>();
  const newWords = (phrases: ApprovedPhrase[], level: number) => {
    const ids = phrases
      .flatMap((phrase) => phrase.pieces.map((word, position) => ({ word, id: phrase.wordIds[position]! })))
      .filter(({ word }) => {
        const info = dictionary.describe(word);
        return (info.kind === "hsk" || info.kind === "unranked") && (info.level ?? offListLevel) === level;
      })
      .map(({ id }) => id)
      .filter((id) => !taught.has(id));
    const unique = [...new Set(ids)];
    for (const id of unique) taught.add(id);
    return unique;
  };

  const beginnerLessons = chunk(
    approved.filter((phrase) => phrase.level === 1),
    beginnerScene * scenesPerLesson,
  ).map((phrases, lessonIndex): LessonPlan => {
    const slug = `${course.slug}-hsk1-${lessonIndex + 1}`;
    return {
      slug,
      title: `Part ${lessonIndex + 1} · ${filmTime(phrases[0]!.start)}–${filmTime(phrases.at(-1)!.end)}`,
      drills: chunk(phrases, beginnerScene).flatMap((scene, sceneIndex) => {
        const words = newWords(scene, 1);
        const scenes = {
          slug: `${slug}-${sceneIndex + 1}`,
          title: `Scenes ${sceneIndex + 1}`,
          phrases: scene,
          wordIds: [],
        };
        if (words.length === 0) return [scenes];
        return [
          {
            slug: `${scenes.slug}-words`,
            title: `Words for Scenes ${sceneIndex + 1}`,
            phrases: [],
            wordIds: words,
          },
          scenes,
        ];
      }),
    };
  });

  taught.clear();
  const advancedLevels = [
    ...new Set(approved.map((phrase) => phrase.level).filter((level) => level > 1)),
  ].sort((a, b) => a - b);
  const advancedLessons = advancedLevels.flatMap((level) =>
    chunk(
      approved.filter((phrase) => phrase.level === level),
      advancedScene * scenesPerLesson,
    ).map((phrases, lessonIndex): LessonPlan => {
      const names = levelLessons(level);
      const slug = `${course.slug}-${names.slug}-${lessonIndex + 1}`;
      const words = newWords(phrases, level);
      return {
        slug,
        title: `${names.title} · Part ${lessonIndex + 1}`,
        drills: [
          ...(words.length > 0
            ? [{ slug: `${slug}-words`, title: "Learn the Words", phrases: [], wordIds: words }]
            : []),
          ...chunk(phrases, advancedScene).map((scene, sceneIndex) => ({
            slug: `${slug}-${sceneIndex + 1}`,
            title: `Scenes ${sceneIndex + 1}`,
            phrases: scene,
            wordIds: [],
          })),
        ],
      };
    }),
  );

  return [
    { slug: course.slug, title: course.title, lessons: beginnerLessons },
    { slug: `${course.slug}-advanced`, title: course.advancedTitle, lessons: advancedLessons },
  ].filter((coursePlan) => coursePlan.lessons.length > 0);
}

/** Creates or updates each approved phrase's Phrases and PhraseWords rows. Returns review id → study id. */
function writeStudyPhrases(
  study: Database,
  review: Database,
  approved: ApprovedPhrase[],
  links: Map<number, StudyPhraseRow>,
  isLinked: (phrase: ApprovedPhrase) => boolean,
) {
  const createPhrase = study.prepare<{ id: number }, [string, string]>(
    "INSERT INTO Phrases (meaning, createdAt) VALUES (?, ?) RETURNING id",
  );
  const updateMeaning = study.prepare("UPDATE Phrases SET meaning = ? WHERE id = ?");
  const currentWords = study.query<{ wordsId: number }, [number]>(
    'SELECT wordsId FROM PhraseWords WHERE phrasesId = ? ORDER BY "order"',
  );
  const clearWords = study.prepare("DELETE FROM PhraseWords WHERE phrasesId = ?");
  const addWord = study.prepare('INSERT INTO PhraseWords ("order", phrasesId, wordsId) VALUES (?, ?, ?)');
  const createdAt = new Date().toISOString();

  const studyIds = study.transaction(
    () =>
      new Map(
        approved.map((phrase) => {
          const { wordIds } = phrase;
          const studyId = isLinked(phrase)
            ? links.get(phrase.id)!.study_id
            : createPhrase.get(phrase.meaning, createdAt)!.id;
          updateMeaning.run(phrase.meaning, studyId);
          if (
            currentWords
              .all(studyId)
              .map((row) => row.wordsId)
              .join() !== wordIds.join()
          ) {
            clearWords.run(studyId);
            for (const [order, wordId] of wordIds.entries()) addWord.run(order, studyId, wordId);
          }
          return [phrase.id, studyId] as const;
        }),
      ),
  )();

  const link = review.prepare(
    "INSERT INTO study_phrases (phrase_id, study_id) VALUES (?, ?) ON CONFLICT (phrase_id) DO UPDATE SET study_id = excluded.study_id, media = CASE WHEN study_phrases.study_id = excluded.study_id THEN study_phrases.media ELSE '' END",
  );
  review.transaction(() => {
    for (const [phraseId, studyId] of studyIds) link.run(phraseId, studyId);
  })();
  return studyIds;
}

/** Replaces both courses' lessons and drills with the plan. Other courses are never touched. */
function writeLayout(study: Database, slug: string, plan: CoursePlan[], studyIds: Map<number, number>) {
  const courseSlugs = [slug, `${slug}-advanced`];
  study.transaction(() => {
    const lessonSlugs = study
      .query<{ slug: string }, [string, string]>("SELECT slug FROM Lesson WHERE courseSlug IN (?, ?)")
      .all(courseSlugs[0]!, courseSlugs[1]!)
      .map((row) => row.slug);
    for (const lessonSlug of lessonSlugs) {
      const drillSlugs = study
        .query<{ slug: string }, [string]>("SELECT slug FROM Drill WHERE lessonSlug = ?")
        .all(lessonSlug)
        .map((row) => row.slug);
      for (const drillSlug of drillSlugs) {
        study.run("DELETE FROM _DrillToPhrases WHERE A = ?", [drillSlug]);
        study.run("DELETE FROM _DrillToWords WHERE A = ?", [drillSlug]);
        study.run("DELETE FROM Drill WHERE slug = ?", [drillSlug]);
      }
      study.run("DELETE FROM Lesson WHERE slug = ?", [lessonSlug]);
    }
    const nextOrdering =
      study.query<{ next: number }, []>("SELECT COALESCE(MAX(ordering), -1) + 1 AS next FROM Course").get()
        ?.next ?? 0;
    const createdAt = new Date().toISOString();
    for (const [courseIndex, coursePlan] of plan.entries()) {
      study.run(
        "INSERT INTO Course (slug, title, ordering, createdAt) VALUES (?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET title = excluded.title",
        [coursePlan.slug, coursePlan.title, nextOrdering + courseIndex, createdAt],
      );
      for (const [lessonIndex, lesson] of coursePlan.lessons.entries()) {
        study.run(
          "INSERT INTO Lesson (slug, title, ordering, courseSlug, createdAt) VALUES (?, ?, ?, ?, ?)",
          [lesson.slug, lesson.title, lessonIndex, coursePlan.slug, createdAt],
        );
        for (const [drillIndex, drill] of lesson.drills.entries()) {
          study.run(
            "INSERT INTO Drill (slug, title, description, lessonSlug, \"order\", createdAt) VALUES (?, ?, '', ?, ?, ?)",
            [drill.slug, drill.title, lesson.slug, drillIndex, createdAt],
          );
          for (const phrase of drill.phrases) {
            study.run("INSERT INTO _DrillToPhrases (A, B) VALUES (?, ?)", [
              drill.slug,
              studyIds.get(phrase.id)!,
            ]);
          }
          for (const wordId of drill.wordIds)
            study.run("INSERT INTO _DrillToWords (A, B) VALUES (?, ?)", [drill.slug, wordId]);
        }
      }
    }
    // A course whose lessons all went away (every phrase unapproved) is removed rather than left empty.
    for (const courseSlug of courseSlugs) {
      if (!plan.some((coursePlan) => coursePlan.slug === courseSlug))
        study.run("DELETE FROM Course WHERE slug = ?", [courseSlug]);
    }
  })();
}
