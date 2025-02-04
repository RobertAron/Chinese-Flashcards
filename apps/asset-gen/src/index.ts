import fs from "node:fs";
import path from "node:path";
import tts from "@google-cloud/text-to-speech";
import dotenv from "dotenv";
import { PrismaClient } from "cms-db";
const prismaClient = new PrismaClient();

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

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

async function main() {
  const data = await prismaClient.words.findMany();
  await client.initialize();
  for (const item of data) {
    const speechFile = path.resolve(`./output/words/${item.id}.mp3`);
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
    await delay(100)
    console.log("complete with", speechFile);
  }
  console.log("Total success!");
}
main();
