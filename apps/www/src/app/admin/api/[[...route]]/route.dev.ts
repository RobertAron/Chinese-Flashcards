import tts from "@google-cloud/text-to-speech";
import { zValidator } from "@hono/zod-validator";
import { S3Client } from "bun";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import sharp from "sharp";
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

const { client_email, private_key } = JSON.parse(auth);
const client = new tts.TextToSpeechClient({
  credentials: { client_email, private_key },
});
const phraseResponse = z.object({
  suggestions: z
    .object({
      phrase: z.string(),
      meaning: z.string(),
      imageDescription: z.string(),
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
  z.record(z.string(), z.object({ characters: z.string(), meaning: z.string() })),
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
        word: z.string(),
        practiceState: practiceState,
      }),
    ),
    async (c) => {
      const query = c.req.valid("json");
      const { output_parsed } = await openaiClient.responses.parse({
        model: "gpt-5",
        text: { format: zodTextFormat(phraseResponse, "PracticePhraseSuggestion") },
        input: [
          {
            role: "system",
            content: `
You are an expert in chinese language teaching, as well as a creative writer. Your job is to help the student become HSK1 proficient. Your job is to create several phrases to help the student learn HSK1 skills.

- You will be given a chinese word which must be included in the phrases.
- You will also be given a list of all HSK1 words, in order by how common they are, starting with the most common to the least.

When reasonable, sprinkle in words that the user has not practiced yet, especially if they are more common.
The images will be used to create a flashcard like experience, which will include the text, TTS of the phrase, and a picture. Practicing the phrases will be similar to reading a children's book. Therefore, it would be beneficial for the phrases to match that style of writing. You will also be asked to create a short description of a scene which could be used to help prompt the user to speak the phrase. 

Constraints:
- Phrase length: 6–12 Chinese characters
- 1-2 clauses
- Avoid extremely common structure "我 + 动词 + 你 + 时间"
- Each phrase should _slightly_ be stranger than the last, enabling some children's book like phrases that you might see in something like "If you give a mouse a cookie". Not quite as creative as something as alice in wonderland though.
- Put spaces between each word and punctuation. For example: "学 中文 半年 ， 会 说 了 。"
- The suggested picture should not suggest including text, unless absolutely necessary.

Structured output as an array. 5 minimum. 10 maximum.:
- phrase: Chinese only, include punctuation. Put spaces between each word. E.G 我 等 你 半天 。
- meaning: English only translation of the phrase.
- imageDescription: one sentence describing the exact scene to illustrate

Guideline examples for abstract words:

- 最 / 最好 / 最多 (best / most):
  Show clear comparison (e.g. 3 items), with the target item visibly superior
  (bigger, brighter, centered, or being chosen)

- Timing (tomorrow, today, later):
  sunrise, calendar page turning, morning light through a window, split image showing comparison between now/later

- 想 (want):
  Character reaching toward or looking longingly at an object

- 有 / 没有 (have / not have):
  Object in hand vs empty hands
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
        phrase: z.string(),
      }),
    ),
    async (c) => {
      const { phrase } = c.req.valid("json");
      const [response] = await client.synthesizeSpeech({
        audioConfig: {
          audioEncoding: "MP3",
          pitch: 0,
          speakingRate: 0.75,
          sampleRateHertz: 48000,
        },
        input: { text: phrase },
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
    zValidator("json", z.object({ phrase: z.string(), extraInstructions: z.string() })),
    async (c) => {
      const { phrase, extraInstructions } = c.req.valid("json");
      const prompt = `
Create a single minimalist anime-style illustration that visually represents the full meaning of this Chinese phrase.

The image is used as a flashcard: the viewer should be able to guess the entire phrase from the scene alone.

Rules:
- No text, symbols, or characters of any kind
- Simple composition, white or light gray background
- Clean cartoon (slightly anime) style with fairly saturated colors
- Depict a coherent scene with an environment (indoor or outdoor)
- Every word in the phrase must be visually implied through the scene
- Clearly show relationships, actions, location, and time when they are part of the phrase
- If the phrase refers to the past, show the action as completed
- The picture should cover the entire frame in most circumstances
- Do not include content which is not relevant to the phrase

Phrase: ${phrase}
${extraInstructions === "" ? "" : `Extra Instructions: ${extraInstructions}`}
`;
      const img = await openaiClient.images
        .generate({
          model: "gpt-image-1.5",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "high",
        })
        .catch((err) => {
          console.log(JSON.stringify(err, null, 2));
          throw err;
        });
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
      const imageWebp = await sharp(Buffer.from(await picture.arrayBuffer()))
        .webp({
          quality: 80,
          effort: 5,
          lossless: false,
          alphaQuality: 90,
        })
        .toBuffer();
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
