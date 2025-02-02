import { PrismaClient } from "cms-db";
import { data as d1 } from "./part-1.js";
import { data as d2 } from "./part-2.js";
import { data as d3 } from "./part-3.js";
import { data as d4 } from "./part-4.js";
import { data as d5 } from "./part-5.js";
import { data as d6 } from "./part-rest.js";

const client = new PrismaClient();

const fullData = [...d1, ...d2, ...d3, ...d4, ...d5, ...d6];
const positionsSoFar: number[] = [];
function guessPosition() {
  return Math.ceil(positionsSoFar.reduce((acc, next) => acc + next, 0) / positionsSoFar.length);
}
async function main() {
  for (let i = 0; i < fullData.length; i++) {
    const word = fullData[i]!;
    console.log(`Item ${i}/${fullData.length}`);
    const already = await client.words.findUnique({
      where: { characters: word.character },
    });
    if (already !== null) {
      positionsSoFar.push(already.frequencyRank);
      console.log("already have", word.character);
      continue;
    }
    const matchingChars = await client.words.findMany({
      where: {
        characters: {
          in: word.character.split(""),
        },
      },
    });
    const maxIndex = Math.max(...matchingChars.map((ele) => ele.frequencyRank));
    const missingCorePieces = maxIndex < 0;

    const increaseAllAfter = missingCorePieces ? guessPosition() : maxIndex + 1;
    if (missingCorePieces) console.warn(`Missing core pieces for this: ${word}`);
    console.log(`injecting ${word.character} at ${increaseAllAfter}`);
    const itemsToIncrease = await client.words.findMany({
      where: { frequencyRank: { gte: increaseAllAfter } },
      orderBy: { frequencyRank: "desc" },
    });
    for (const item of itemsToIncrease) {
      await client.words.update({
        where: { id: item.id },
        data: {
          frequencyRank: item.frequencyRank + 1,
        },
      });
    }
    await client.words.create({
      data: {
        characters: word.character,
        frequencyRank: increaseAllAfter,
        meaning: word.meaning,
        pinyin: word.pinyin,
      },
    });
  }
}

main();
