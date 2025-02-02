import { PrismaClient } from "cms-db";
import { data as d1 } from "./part-1.js";
import { data as d2 } from "./part-2.js";
import { data as d3 } from "./part-3.js";
import { data as d4 } from "./part-4.js";
import { data as d5 } from "./part-5.js";
import { data as d6 } from "./part-rest.js";

const client = new PrismaClient();

const fullData = [...d1, ...d2, ...d3, ...d4, ...d5, ...d6];
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const wordChunks = chunkArray(fullData, 5);
  const sectionChunks = chunkArray(wordChunks, 5);
  for (let i = 0; i < sectionChunks.length; i++) {
    const sections = sectionChunks[i]!;
    const title = `Words For Beginners ${i + 1}`;
    const slug = `words-for-beginners-${i + 1}`;
    await client.topic.create({
      data: {
        title,
        slug,
      },
    });
    for (let j = 0; j < sections.length; j++) {
      const thisSection = sections[j]!;
      const words = await client.words.findMany({
        where: { characters: { in: thisSection.map((ele) => ele.character) } },
      });
      await client.challenge.create({
        data: {
          slug: `beginner-words-${i + 1}-${j + 1}`,
          title: `Beginner Words Section ${i + 1} ${j + 1}`,
          description: "",
          order: j,
          topicSlug: slug,
          words: {
            connect: words.map((ele) => ({ id: ele.id })),
          },
        },
      });
      console.log({
        title,
        slug,
        words,
      });
    }
  }
}

main();
