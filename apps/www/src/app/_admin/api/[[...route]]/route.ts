import tts from "@google-cloud/text-to-speech";
import { zValidator } from "@hono/zod-validator";
import { S3Client } from "bun";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import OpenAI from "openai";
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

const app = new Hono()
  .basePath("/admin/api")
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
  .post("/generate-image", zValidator("json", z.object({ phrase: z.string() })), async (c) => {
    const { phrase } = c.req.valid("json");
    const prompt = `
You will receive a Chinese phrase. Create an image that visually represents the meaning of the phrase.
The image will be used as a flashcard, where the viewer guesses or writes the phrase based on the image.
Guidelines:
•	Do not include text.
•	Do not include chinese characters.
•	Do not include emojis.
•	Style should be minimal/anime/cartoon.
•	Every word in the phrase must be visually represented — the image should make each word essential to understanding the overall meaning.
•	The background should be white, or grey.
•	Use fairly saturated colors otherwise. Avoid sepia colors.
•	Keep the image simple by reducing hues. Use primarily these colors.
Phrase:
${phrase}
`;
    const img = await openaiClient.images.generate({
      model: "gpt-image-1-mini",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    });
    const b64 = img.data?.[0]!.b64_json!;
    return c.json({ b64 });
  })
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
