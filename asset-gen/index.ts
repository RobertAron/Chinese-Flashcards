import fs from "fs";
import dotenv from "dotenv";
import tts from "@google-cloud/text-to-speech";
import path from "path";

const env = dotenv.config({ path: ".env" });
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

const data = [
  {
    character: "一",
    pinyin: "yī",
    definition: "det.: one ",
  },
  {
    character: "在",
    pinyin: "zài",
    definition: "in, at, on, etc. ",
  },
  {
    character: "有",
    pinyin: "yǒu",
    definition: "have, possess",
  },
  {
    character: "个",
    pinyin: "gè",
    definition: "piece, item ",
  },
  {
    character: "我",
    pinyin: "wǒ",
    definition: "I, me, ego, self ",
  },
];

async function main() {
  await client.initialize();
  const result = await Promise.allSettled(
    data.map(async (item) => {
      const speechFile = path.resolve(`./output/${item.pinyin}.mp3`);
      const [response] = await client.synthesizeSpeech({
        audioConfig: {
          audioEncoding: "MP3",
          pitch: 0,
          speakingRate: 0.75,
          sampleRateHertz: 48000,
        },
        input: {
          text: item.character,
        },
        voice: {
          languageCode: "cmn-CN",
          name: "cmn-CN-Wavenet-B",
        },
      });
      if (response.audioContent == null) throw new Error("Failed");
      await fs.promises.writeFile(speechFile, response.audioContent, "binary");
    })
  );
  const anyRejected = result.find((ele) => ele.status === "rejected");
  if (anyRejected !== undefined) process.exit(1);
}
main();
