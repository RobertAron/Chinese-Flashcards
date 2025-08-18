import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.phrases.createMany({
    data: [
      {
        characters: "妈妈 在 家 看书。",
        meaning: "Mom is at home reading a book.",
        pinyin: "māma zài jiā kàn shū.",
        emojiChallenge: "👩🏠📖",
      },
    ],
  });
}

main();
