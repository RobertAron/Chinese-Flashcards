// https://cloud.google.com/text-to-speech?hl=en
import fs from "node:fs";
import { $ } from "bun";
import path from "node:path";
import tts from "@google-cloud/text-to-speech";
import { getDb } from "cms-data";
import dotenv from "dotenv";
import { askYesNo } from "./askYesNo";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const basePath = join(import.meta.dir, "../dist"); // Resolves to project root's dist
const dirs = [join(basePath, "words"), join(basePath, "phrases")];
for (const dir of dirs) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
}

const dbPath = path.resolve(__dirname, "../../www/local.db");
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const env = dotenv.config({ path: ".env.local" });
const auth = env.parsed?.GOOGLE_APPLICATION_CREDENTIALS;
if (typeof auth !== "string") {
  console.log("missing api key");
  process.exit(1);
}
const { client_email, private_key } = JSON.parse(auth);
const client = new tts.TextToSpeechClient({
  credentials: {
    client_email,
    private_key,
  },
});

const drizzleClient = getDb(dbPath);

export function wordToAudioSource(id: number) {
  return `words/${id}.mp3`;
}
export function phraseToAudioSource(id: number) {
  return `phrases/${id}.mp3`;
}

async function getCurrentFilesInBucket() {
  const output = await $`rclone ls r2Language:vocab-sprint`.text();
  const currentFiles = output.split("\n").map((ele) => ele.trim().split(" ")[1]);
  return new Set(currentFiles);
}

async function getAllPhrases() {
  return await drizzleClient.query.phrases.findMany({
    columns: {
      characters: true,
      id: true,
    },
  });
}

async function getAllWords() {
  return await drizzleClient.query.words.findMany({
    columns: {
      characters: true,
      id: true,
    },
  });
}

async function main() {
  const [filesInBucket, phrases, words] = await Promise.all([
    getCurrentFilesInBucket(),
    getAllPhrases(),
    getAllWords(),
  ]);
  const phrasesNotYetUploaded = phrases
    .map((ele) => ({
      ...ele,
      fileName: phraseToAudioSource(ele.id),
    }))
    .filter((ele) => !filesInBucket.has(ele.fileName));
  const wordsNotYetUploaded = words
    .map((ele) => ({
      ...ele,
      fileName: wordToAudioSource(ele.id),
    }))
    .filter((ele) => !filesInBucket.has(ele.fileName));
  if (phrasesNotYetUploaded.length === 0 && wordsNotYetUploaded.length === 0) {
    console.log("No work to do.");
    // process.exit(0);
  } else {
    if (phrasesNotYetUploaded.length !== 0)
      console.log(`Going to generate ${phrasesNotYetUploaded.length} phrases`);
    if (wordsNotYetUploaded.length !== 0)
      console.log(`Going to generate ${wordsNotYetUploaded.length} words`);
  }
  const generateAudio = await askYesNo("generate audio?");
  if (!generateAudio) process.exit(1);
  await client.initialize();
  const data = [...phrasesNotYetUploaded, ...wordsNotYetUploaded];
  for (const item of data) {
    const speechFile = path.resolve(`./dist/${item.fileName}`);
    const res = await client.synthesizeSpeech({
      audioConfig: {
        audioEncoding: "MP3",
        pitch: 0,
        speakingRate: 0.75,
        sampleRateHertz: 48000,
      },
      input: {
        text: item.characters,
      },
      voice: {
        languageCode: "cmn-CN",
        name: "cmn-CN-Wavenet-B",
      },
    });
    const [response] = res;
    if (response.audioContent == null) throw new Error(JSON.stringify(res));
    await fs.promises.writeFile(speechFile, response.audioContent, "binary");
    await delay(100);
    console.log("complete with", speechFile);
  }

  await $`rclone copy ./dist r2Language:vocab-sprint --dry-run`;
  const uploadAudio = await askYesNo("upload audio?");
  if(uploadAudio){
    console.log("Running `rclone copy ./dist r2Language:vocab-sprint`")
    await $`rclone copy ./dist r2Language:vocab-sprint`;
  }
  process.exit(0)
}
main();
