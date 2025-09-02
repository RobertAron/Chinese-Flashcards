import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      slug: "people-adjectives-3",
      title: "Handsome, Pretty, and Bad",
      lessonSlug: "people-adjectives",
      description:
        "坏 can mean an object is broken or that someone is ‘bad,’ so context matters.",
      Phrases: {
        create: [
          {
            characters: "我 的 妻子 很 漂亮。",
            meaning: "My wife is beautiful.",
            pinyin: "wǒ de qīzi hěn piàoliang.",
            emojiChallenge: "👩✨😊",
          },
        ],
      },
    },
  });

}

main();
