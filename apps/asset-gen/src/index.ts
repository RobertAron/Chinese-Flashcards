import fs from "node:fs";
import path from "node:path";
import tts from "@google-cloud/text-to-speech";
import { commonWords as data } from "common-data/common-words";
import dotenv from "dotenv";

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

async function main() {
  await client.initialize();
  const result = await Promise.allSettled(
    data.map(async (item) => {
      const speechFile = path.resolve(`./output/${item.fileName}`);
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
    }),
  );
  const rejectedQueries = result
    .map((ele, index) => (ele.status === "rejected" ? data[index] : null))
    .filter((ele) => ele !== null);
  if (rejectedQueries.length !== 0) {
    console.log("some failed queries");
    console.log(JSON.stringify(rejectedQueries, null, 2));
    process.exit(1);
  } else {
    console.log("Total success!");
  }
}
main();
