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
### Chinese Phrase Image Generation Prompt
You will receive a **Chinese phrase**. Create a single image that conveys the **complete meaning** of the phrase through **visual storytelling**.  
The image will be used as a flashcard where the viewer guesses or writes the phrase based on the scene.
---
Style & Visual Guidelines
- Do **not** include any text, Chinese characters, or emojis.
- Style: **minimal**, **anime/cartoon**.  
- Background: **white** or **light grey**.  
- Use **fairly saturated colors**, avoid sepia tones.  
- Keep the composition **simple and clear**.
---
Semantic Requirements
- Depict a **scene** where the phrase would naturally occur — not just isolated objects.  
- Every **word** in the phrase must be visually represented.  
- Clearly show **relationships** (e.g., who is whose sister, what action happened, where it took place).  
- Express **time or tense** if relevant — use visual cues like:
  - younger/older versions of a character for age differences
  - contextual objects or clothing to indicate time period  
- The image should make sense **only when all words** are understood together (not from one word alone).
- If the content was in the past, make sure that it shows that the task is completed/not in progress.
  For example if the phrase is about being done eating, there should be an empty plate.
---
Process
Before creating the image:
1. **Describe** in one sentence the full scene that represents the meaning of the phrase — including *who*, *when*, *where*, and *what’s happening*.  
2. Image a cartoon where a character would say the phrase. Draw that setting.
3. If the phrase is a question, make sure it's a conversation between two people.
4. Unless relevant content, make sure things like TVs have no content on them.
5. Then, **draw that scene**.
---
Example
**Phrase:** 我 妹妹 小 时候 住 在 北京。  
**Interpretation:** “My little sister lived in Beijing when she was young.”  
**Cartoon Example:** An adult reminiscing (my) while looking at a childhood photo (little sister young) of his little sister playing near a Beijing house (lived at), showing both past and relationship context.
---
**Phrase:** ${phrase}
`;
    const img = await openaiClient.images.generate({
      model: "gpt-image-1-mini",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    }).catch(err=>{
      console.log(JSON.stringify(err,null,2))
      throw err
    });
    // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: its there 4 sure
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
