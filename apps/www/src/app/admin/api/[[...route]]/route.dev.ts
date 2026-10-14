import tts from "@google-cloud/text-to-speech";
import { zValidator } from "@hono/zod-validator";
import { Image, S3Client } from "bun";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import z from "zod";
import { getPrismaClient } from "@/utils/getPrismaClient";

const auth = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!auth) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS");

const r2 = new S3Client({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.CF_R2_ENDPOINT,
});
const openaiClient = new OpenAI();

function buildPhraseImagePrompt({
  phrase,
  meaning,
  extraInstructions = "",
}: {
  phrase: string;
  meaning: string;
  extraInstructions?: string;
}) {
  return `
Create one illustration for a Chinese learning flashcard. A learner looks at the picture and tries to say the phrase below, so the scene should make the meaning of the whole phrase guessable without any words.

Style:
- Clean, minimal cartoon illustration with a light anime influence and fairly saturated colors.
- Full-bleed scene that fills the frame, with a soft, light, uncluttered background.
- Simple composition: only the characters, objects, and setting the phrase needs.

Content:
- Show the meaning of the phrase as a whole, in a natural setting where it would happen.
- Make who is involved, what they are doing, where, and when clear whenever the phrase states them.
- Show past or completed actions as already finished. Show future or intended actions as about to happen.
- Grammatical particles (like 的, 了, 在, 吗) don't need their own visual.
- Don't include any text, letters, Chinese characters, numbers, speech bubbles with words, or signs. Written text would give away the answer.

Phrase: ${phrase.replaceAll(" ", "")}
Meaning: ${meaning}
${extraInstructions.trim() === "" ? "" : `Scene notes (follow these when they don't conflict with the rules above): ${extraInstructions.trim()}`}
`.trim();
}

const { client_email, private_key } = JSON.parse(auth);
const client = new tts.TextToSpeechClient({
  credentials: { client_email, private_key },
});
// Combining diacritics (after NFD normalization) for tones 1–4; no mark means neutral tone 5.
const toneByMark: Record<string, number> = { "̄": 1, "́": 2, "̌": 3, "̀": 4 };
// Google TTS wants numbered pinyin ("hai2"); the dictionary stores tone marks ("hái"). Returns null for
// anything that isn't one plain syllable (e.g. ü, or irregular entries) so the caller falls back to plain text.
function toNumberedPinyin(pinyin: string) {
  const letters = [...pinyin.trim().toLowerCase().normalize("NFD")];
  const markedTone = letters.map((letter) => toneByMark[letter]).find((tone) => tone !== undefined);
  const match = letters
    .filter((letter) => toneByMark[letter] === undefined)
    .join("")
    .match(/^([a-z]+)([1-5])?$/);
  if (match === null) return null;
  return `${match[1]}${markedTone ?? match[2] ?? 5}`;
}
const escapeXml = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
function toSsml(words: { characters: string; pinyin: string | null }[]) {
  const body = words
    .map(({ characters, pinyin }) => {
      const phoneme = pinyin === null || [...characters].length !== 1 ? null : toNumberedPinyin(pinyin);
      if (phoneme === null) return escapeXml(characters);
      return `<phoneme alphabet="pinyin" ph="${phoneme}">${escapeXml(characters)}</phoneme>`;
    })
    .join("");
  return `<speak>${body}</speak>`;
}
const phraseResponse = z.object({
  suggestions: z
    .object({
      phrase: z
        .string()
        .describe("Chinese only, with punctuation. A single space between every word and punctuation mark."),
      meaning: z.string().describe("Natural English translation of the phrase."),
      imageDescription: z
        .string()
        .describe(
          "One or two sentences describing a single illustrated scene that shows the phrase's meaning.",
        ),
    })
    .array()
    .min(5)
    .max(10),
});
const practiceState = z.preprocess(
  (v) => {
    if (typeof v !== "string") return v;
    return JSON.parse(v);
  },
  z.record(z.string(), z.object({ characters: z.string(), meaning: z.string(), practiceCount: z.number() })),
);
export type ParsedPracticeState = z.output<typeof practiceState>;
// https://platform.openai.com/docs/guides/structured-outputs?example=structured-data#structured-data-extraction
const app = new Hono()
  .basePath("/admin/api")
  .post(
    "/generate-phrase-suggestion",
    zValidator(
      "json",
      z.object({
        word: z.string().nonempty(),
        extraWordInstructions: z.string(),
        practiceState,
      }),
    ),
    async (c) => {
      const query = c.req.valid("json");
      const { output_parsed } = await openaiClient.responses.parse({
        model: "gpt-6-sol",
        text: { format: zodTextFormat(phraseResponse, "PracticePhraseSuggestion") },
        input: [
          {
            role: "system",
            content: `
You are an expert Chinese teacher and a playful children's-book writer. You write short practice phrases for a student working toward HSK1.

How the phrases are used: each phrase becomes a flashcard with the Chinese text, text-to-speech audio, and an illustration. The student looks at the picture and tries to say the phrase, a bit like reading a children's picture book. So phrases should be simple, concrete, and easy to picture, in the style of a children's book.

Input (JSON):
- word: the target word. Every phrase must include it.
- practiceState: every HSK1 word the student can use, ordered from most to least common. practiceCount is how often the student has practiced it; 0 means not yet practiced.
- extraWordInstructions: optional topic or content to write about. Follow it when it's present.

Vocabulary:
- Build phrases from practiceState words plus the target word. Use other words only when extraWordInstructions calls for them.
- Where it stays natural, include one or two unpracticed words (practiceCount 0), preferring the more common ones. For example, if 不是 has practiceCount 0, it's a good candidate. Never make a phrase awkward just to fit a word in.

Word separation: the phrase is split on spaces and each piece is looked up in the dictionary, so every space-separated piece must exactly match the characters of one practiceState entry or the target word. Don't merge entries into a longer word, and don't split an entry into smaller pieces. Punctuation (， 。 ？ ！) is its own piece. Example: "学 中文 半年 ， 会 说 了 。"

Phrases:
- 6–12 Chinese characters, one or two clauses.
- Natural, correct Mandarin that a native speaker would actually say.
- Vary sentence structure, subjects, and settings across the suggestions. Avoid leaning on the very common "我 + verb + 你 + time" pattern.
- Fun and a little silly is good: everyday cartoon situations with a surprising or absurd twist. Come up with a fresh idea for each suggestion.

Image descriptions:
- Describe one illustrated scene (not a comic or multiple panels) that makes the full meaning guessable: who, what, where, and when if the phrase says it.
- No written text in the scene. The picture must not give away the words.
- For abstract words, use a concrete visual:
  - 最 / 最好 / 最多: a clear comparison between a few items, with the target one visibly bigger, brighter, or being chosen.
  - Time words (今天, 明天, 以后): sunrise, a calendar page turning, morning light, or a before/after contrast within the scene.
  - 想: a character reaching toward or looking longingly at something.
  - 有 / 没有: holding the object vs. empty hands.

Return 5–10 suggestions.
`.trim(),
          },
          {
            role: "user",
            content: JSON.stringify(query),
          },
        ],
      });
      if (output_parsed === null) return c.text("Error", { status: 500 });
      return c.json(output_parsed.suggestions, { status: 200 });
    },
  )
  .post(
    "/generate-audio",
    zValidator(
      "json",
      z.object({
        words: z.object({ characters: z.string(), pinyin: z.string().nullable() }).array(),
      }),
    ),
    async (c) => {
      const { words } = c.req.valid("json");
      const [response] = await client.synthesizeSpeech({
        audioConfig: {
          audioEncoding: "MP3",
          pitch: 0,
          speakingRate: 0.75,
          sampleRateHertz: 48000,
        },
        input: { ssml: toSsml(words) },
        voice: {
          languageCode: "cmn-CN",
          name: "cmn-CN-Wavenet-B",
        },
      });

      if (!response.audioContent) throw new Error("No audio returned");
      return new Response(Buffer.from(response.audioContent));
    },
  )
  .post(
    "/generate-image",
    zValidator("json", z.object({ phrase: z.string(), meaning: z.string(), extraInstructions: z.string() })),
    async (c) => {
      const { phrase, meaning, extraInstructions } = c.req.valid("json");
      const prompt = buildPhraseImagePrompt({ phrase, meaning, extraInstructions });
      const imageStartTime = Date.now();
      const img = await openaiClient.images
        .generate({
          model: "gpt-image-2.5-sunburst",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "medium",
        })
        .catch((err) => {
          console.log(JSON.stringify(err, null, 2));
          throw err;
        });
      console.log(`Made image in ${((Date.now() - imageStartTime) / 1000).toFixed(2)} seconds`);
      // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: its there 4 sure
      const b64 = img.data?.[0]!.b64_json;
      return c.json({ b64 });
    },
  )
  .post(
    "/submit-challenge",
    zValidator(
      "form",
      z.object({
        meaning: z.string(),
        audio: z.file(),
        picture: z.string().transform((base64String) => {
          const buffer = Buffer.from(base64String, "base64");
          const blob = new Blob([buffer], { type: "image/png" });
          const file = new File([blob], "example.png", { type: "image/png" });
          return file;
        }),
        // weird bug
        words: z.array(z.string().pipe(z.coerce.number())),
      }),
    ),
    async (c) => {
      const { audio, meaning, picture, words } = c.req.valid("form");
      const imageWebp = await new Image(picture)
        .resize(768, 768, { filter: "mitchell" })
        .webp({ quality: 75 })
        .bytes();
      const { id } = await getPrismaClient().phrases.create({
        data: {
          meaning,
          PhraseWords: {
            createMany: { data: words.map((ele, index) => ({ order: index, wordsId: ele })) },
          },
        },
        select: {
          id: true,
        },
      });
      await Promise.all([r2.write(`phrases/${id}.mp3`, audio), r2.write(`phrases/${id}.webp`, imageWebp)]);
      return c.json({ message: "OK" });
    },
  );
export type Api = typeof app;

export const GET = handle(app);
export const POST = handle(app);
