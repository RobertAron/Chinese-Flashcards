import fs from "fs";
import { decoders } from "audio-decode";
import webfft from "webfft";
import { createCanvas } from "canvas";
const size = 2 ** 10;
const fft = new webfft(size);
fft.setSubLibrary("kissfftmodifiedWasm");

function fftOutputToLowHighBuckets(buffer: Float32Array<ArrayBufferLike>) {
  const finalResults: number[] = [];
  for (let i = 1; i < buffer.length / 2; i++) {
    finalResults.push(Math.sqrt(buffer[i - 1] ** 2 + buffer[i] ** 2));
  }
  return finalResults;
}

const aspect = 1000
async function main() {
  // "./output/yǒu.mp3"
  // "./temp/test-audio.wav"
  const res = await fs.promises.readFile("./output/yǒu.wav");
  const result = await decoders.wav(res);
  const chanel0 = result.getChannelData(0);
  const canvas = createCanvas(aspect, aspect);
  const ctx = canvas.getContext("2d");
  const chunkLength = size * 2;
  const subChunk = 50;
  const audioChunks = (chanel0.length / chunkLength) * subChunk;
  const chunkResults: number[][] = [];
  let max = 0;
  for (let chunkIndex = 0; chunkIndex < audioChunks; chunkIndex++) {
    const subitems = chanel0.slice(
      chunkLength * (chunkIndex / subChunk),
      chunkLength * (chunkIndex / subChunk + 1)
    );
    if (subitems.length < chunkLength) {
      continue;
    }
    const fftOutput = fft.fft(subitems);
    const lowHighBuckets = fftOutputToLowHighBuckets(fftOutput);
    chunkResults.push(lowHighBuckets);
    max = Math.max(max, ...lowHighBuckets);
  }
  const xSliceWidth = aspect / audioChunks;
  const ySliceHeight = aspect / chunkResults[0].length;
  const normalizeFactor = 255 / max;
  let highestSoFar = 0;
  for (let chunkIndex = 0; chunkIndex < chunkResults.length; chunkIndex++) {
    const lowHighBuckets = chunkResults[chunkIndex];
    for (let freqBucket = 0; freqBucket < lowHighBuckets.length; freqBucket++) {
      const normalized = lowHighBuckets[freqBucket] * normalizeFactor;

      const strength = normalized>50?0:255;
      if (highestSoFar < normalized) highestSoFar = normalized;
      ctx.fillStyle = `rgba(${strength}, ${strength}, ${strength}, 1)`;
      const y = aspect - freqBucket * ySliceHeight;
      const x = xSliceWidth * chunkIndex;
      ctx.fillRect(x, y, Math.ceil(xSliceWidth), Math.ceil(ySliceHeight));
    }
  }

  // buckets go from 0-44.1khz. Most important speech content is only from 0-11khz
  // const importantBuckets = lowHighBuckets.slice(
  //   0,
  //   Math.floor(lowHighBuckets.length / 4)
  // );

  const pngBuffer = canvas.toBuffer();
  fs.writeFileSync("./output.png", pngBuffer);
}

main();
