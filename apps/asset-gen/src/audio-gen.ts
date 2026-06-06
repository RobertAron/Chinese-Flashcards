import path from "node:path";
import tts from "@google-cloud/text-to-speech";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { S3Client } from "bun";
import { PrismaClient } from "vocab-db/prisma";
import { askYesNo } from "./askYesNo";

const auth = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!auth) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS");

const dryRun = process.argv.includes("--dry-run");

const rawEndpoint = process.env.CF_R2_ENDPOINT;
if (!rawEndpoint) throw new Error("Missing CF_R2_ENDPOINT");
const endpointUrl = new URL(rawEndpoint);
const endpoint = `${endpointUrl.protocol}//${endpointUrl.host}`;

const r2 = new S3Client({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint,
  bucket: "vocab-sprint",
});

const { client_email, private_key } = JSON.parse(auth);
const ttsClient = new tts.TextToSpeechClient({
  credentials: { client_email, private_key },
});

async function listExistingIds(prefix: string): Promise<Set<number>> {
  const ids = new Set<number>();
  let continuationToken: string | undefined;
  do {
    const res = await r2.list({ prefix, continuationToken });
    for (const obj of res.contents ?? []) {
      const match = obj.key?.match(/(\d+)\.mp3$/);
      if (match) ids.add(Number(match[1]));
    }
    continuationToken = res.isTruncated ? res.nextContinuationToken : undefined;
  } while (continuationToken);
  return ids;
}

async function synthesize(text: string): Promise<Buffer> {
  const [response] = await ttsClient.synthesizeSpeech({
    audioConfig: {
      audioEncoding: "MP3",
      pitch: 0,
      speakingRate: 0.75,
      sampleRateHertz: 48000,
    },
    input: { text },
    voice: {
      languageCode: "cmn-CN",
      name: "cmn-CN-Wavenet-B",
    },
  });
  if (!response.audioContent) throw new Error(`No audio returned for: ${text}`);
  return Buffer.from(response.audioContent);
}

async function generateAndUpload(kind: "words" | "phrases", id: number, text: string) {
  console.log(`generating ${kind}/${id}: ${text}`);
  const buffer = await synthesize(text);
  await r2.write(`${kind}/${id}.mp3`, buffer);
  console.log(`uploaded ${kind}/${id}.mp3`);
}

async function main() {
  const dbPath = path.resolve(`${process.cwd()}/../db/local.db`);
  const prisma = new PrismaClient({
    adapter: new PrismaLibSQL({ url: `file:${dbPath}` }),
  });

  const [words, phrasesRaw, existingWordIds, existingPhraseIds] = await Promise.all([
    prisma.words.findMany({ select: { id: true, characters: true }, orderBy: { id: "asc" } }),
    prisma.phrases.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        PhraseWords: {
          orderBy: { order: "asc" },
          select: { word: { select: { characters: true } } },
        },
      },
    }),
    listExistingIds("words/"),
    listExistingIds("phrases/"),
  ]);

  const phrases = phrasesRaw.map((p) => ({
    id: p.id,
    characters: p.PhraseWords.map((pw) => pw.word.characters).join(""),
  }));

  const missingWords = words.filter((w) => !existingWordIds.has(w.id));
  const missingPhrases = phrases.filter((p) => !existingPhraseIds.has(p.id));

  console.log(`Missing ${missingWords.length} words, ${missingPhrases.length} phrases.`);

  if (dryRun) {
    for (const w of missingWords) console.log(`  word ${w.id}: ${w.characters}`);
    for (const p of missingPhrases) console.log(`  phrase ${p.id}: ${p.characters}`);
    return;
  }

  if (missingWords.length === 0 && missingPhrases.length === 0) {
    console.log("Nothing to generate.");
    return;
  }

  console.log({
    missingWords: missingWords.length,
    missingPhrases: missingPhrases.length,
  });

  const proceed = await askYesNo("Generate?");
  if (!proceed) return;

  const batchSize = 10;
  for (let i = 0; i < missingWords.length; i += batchSize) {
    const batch = missingWords.slice(i, i + batchSize);
    await Promise.all(batch.map((w) => generateAndUpload("words", w.id, w.characters)));
  }
  for (let i = 0; i < missingPhrases.length; i += batchSize) {
    const batch = missingPhrases.slice(i, i + batchSize);
    await Promise.all(batch.map((p) => generateAndUpload("phrases", p.id, p.characters)));
  }

  console.log("Done.");
}

main();
