import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";
import { hsk7 } from "../hsk/7";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  let newItem = 0;
  let updateItem = 0;
  for (const word of hsk7) {
    const res = await prisma.words.findFirst({
      where: {
        characters: word.simplified,
      },
    });
    if (res === null) {
      newItem += 1;
      await prisma.words.create({
        data: {
          hskLevel: "hsk7",
          characters: word.simplified,
          frequencyRank: word.frequency,
          meaning: word.forms.flatMap((ele) => ele.meanings).join("; "),
          pinyin: word.forms[0].transcriptions.pinyin
            .split("")
            .filter((ele) => ele !== " ")
            .join(""),
        },
      });
    } else {
      updateItem += 1;
      await prisma.words.updateMany({
        where: {
          characters: word.simplified,
        },
        data: {
          hskLevel: "hsk7",
        },
      });
    }
  }
  console.log({
    newItem,
    updateItem,
  });
}

main();
