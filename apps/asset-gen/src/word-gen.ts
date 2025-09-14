import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";
import { hsk1 } from "../hsk/hsk1";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  for (const word of hsk1) {
    const res = await prisma.words.updateMany({
      where: {
        characters: word[1],
      },
      data: {
        meaning: word[3],
        hskLevel: "hsk1",
      },
    });
    if (res === null) return;
  }
}

main();
