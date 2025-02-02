import { PrismaClient } from "cms-db";
import { data as d1 } from "./part-1.js";
import { data as d2 } from "./part-2.js";
import { data as d3 } from "./part-3.js";
import { data as d4 } from "./part-4.js";
import { data as d5 } from "./part-5.js";
import { data as d6 } from "./part-6.js";
import { data as d7 } from "./part-7.js";
import { data as d8 } from "./part-8.js";
import { data as d9 } from "./part-9.js";

const client = new PrismaClient();

const fullData = [...d1, ...d2, ...d3, ...d4, ...d5, ...d6, ...d7, ...d8, ...d9]
  .map((ele, index) => ({
    ...ele,
  }))
  .reduce((acc: typeof d1, next) => {
    const sameIndex = acc.findIndex((ele) => ele.character === next.character);
    if (sameIndex !== -1) {
      acc[sameIndex]!.meaning += `; ${next.meaning}`;
    } else {
      acc.push(next);
    }
    return acc;
  }, [])
  .map((ele, index) => ({
    ...ele,
    index,
  }));
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const chunked = chunkArray(fullData, 100);
  await client.words.deleteMany()
  for (const chunk of chunked) {
    await client.words.createMany({
      data: chunk.map((ele) => ({
        characters: ele.character,
        frequencyRank: ele.index,
        meaning: ele.meaning,
        pinyin: ele.pinyin,
      })),
    });
  }
}

main();
