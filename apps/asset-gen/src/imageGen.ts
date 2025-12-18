import path from "node:path";
import { S3Client } from "bun";
import OpenAI from "openai";
import sharp from "sharp";
import { PrismaClient } from "vocab-db/prisma";

const auth = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!auth) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS");

const r2 = new S3Client({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.CF_R2_ENDPOINT,
});
const openaiClient = new OpenAI();

async function makeConvertUpload(phrase: string, id: string) {
  console.log("starting:", id);
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
  - faded backgrounds or sepia tones for “past”
  - younger/older versions of a character for age differences
  - contextual objects or clothing to indicate time period  
- The image should make sense **only when all words** are understood together (not from one word alone).
---
Process
Before creating the image:
1. **Describe** in one sentence the full scene that represents the meaning of the phrase — including *who*, *when*, *where*, and *what’s happening*.  
2. Then, **draw that scene**.
---
Example
**Phrase:** 我 妹妹 小 时候 住 在 北京。  
**Interpretation:** “My little sister lived in Beijing when she was young.”  
**Good depiction:** An adult reminiscing while looking at a childhood photo of his little sister playing near a Beijing hutong, showing both past and relationship context.
---
**Phrase:** ${phrase}
`;
  const img = await openaiClient.images.generate({
    model: "gpt-image-1.5",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "high",
  });
  // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: it's there
  const b64 = img.data?.[0].b64_json!;
  const buffer = Buffer.from(b64, "base64");
  const blob = new Blob([buffer], { type: "image/png" });
  const file = new File([blob], "example.png", { type: "image/png" });
  const imageWebp = await sharp(Buffer.from(await file.arrayBuffer()))
    .webp({
      quality: 80,
      effort: 5,
      lossless: false,
      alphaQuality: 90,
    })
    .toBuffer();
  await r2.write(`phrases/${id}.webp`, imageWebp);
}

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../db/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  const phrasesRaw = await prisma.phrases.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      PhraseWords: {
        orderBy: {
          order: "asc",
        },
        select: {
          word: {
            select: {
              characters: true,
            },
          },
        },
      },
    },
  });
  const phrases = phrasesRaw.map((ele) => ({
    id: ele.id,
    characters: ele.PhraseWords.map((ele) => ele.word.characters).join(""),
  }));
  const batchSize = 10;
  for (let i = 0; i < phrases.length; i += batchSize) {
    const batch = phrases.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => makeConvertUpload(item.characters, `${item.id}`)));
  }
}

main();
