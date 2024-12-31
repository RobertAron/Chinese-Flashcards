import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from 'dotenv';

const env = dotenv.config({path:".env.local"})
const key = env.parsed!.OPENAI_API_KEY!
// console.log(process.env)

// const openai = new OpenAI({
//   apiKey:env.parsed
// });

// const speechFile = path.resolve("./speech.mp3");

// async function main() {
//   const mp3 = await openai.audio.speech.create({
//     model: "tts-1",
//     voice: "alloy",
//     input: "Today is a wonderful day to build something people love!",
//   });
//   console.log(speechFile);
//   const buffer = Buffer.from(await mp3.arrayBuffer());
//   await fs.promises.writeFile(speechFile, buffer);
// }
// main();