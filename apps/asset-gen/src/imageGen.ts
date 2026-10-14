import path from "node:path";
import { Image, S3Client } from "bun";
import OpenAI from "openai";
import { PrismaClient } from "vocab-db/prisma";

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
- Don't include any text that would give away the answer.

Phrase: ${phrase.replaceAll(" ", "")}
Meaning: ${meaning}
${extraInstructions.trim() === "" ? "" : `Scene notes (follow these when they don't conflict with the rules above): ${extraInstructions.trim()}`}
`.trim();
}

async function makeConvertUpload(phrase: string, meaning: string, id: string) {
  console.log("starting:", id);
  const prompt = buildPhraseImagePrompt({ phrase, meaning });
  const img = await openaiClient.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "high",
  });
  // biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: it's there
  const b64 = img.data?.[0].b64_json!;
  const imageWebp = await new Image(Buffer.from(b64, "base64"))
    .resize(768, 768, { filter: "mitchell" })
    .webp({ quality: 75 })
    .bytes();
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
      meaning: true,
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
    meaning: ele.meaning,
    characters: ele.PhraseWords.map((ele) => ele.word.characters).join(""),
  }));
  const batchSize = 10;
  for (let i = 0; i < phrases.length; i += batchSize) {
    const batch = phrases.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => makeConvertUpload(item.characters, item.meaning, `${item.id}`)));
  }
}

main();
