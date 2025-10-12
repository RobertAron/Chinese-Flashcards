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
  console.log(phrases);
  const batchSize = 10;
  for (let i = 0; i < phrases.length; i += batchSize) {
    const batch = phrases.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => makeConvertUpload(item.characters,`${item.id}`)));
  }
}

main();
