import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      title: "When?",
      slug: "asking-questions-12",
      lessonSlug: "core-questions-2",
      order: 8,
      description: "",
      Phrases: {
        create: [
          {
            characters: "你什么时候来？",
            meaning: "You're coming when?",
            pinyin: "nǐ shénme shíhou lái?",
            emojiChallenge: "👤⌛❓👣", // 👤(you) + ⌛❓(when) + 👣(come)
          },
          {
            characters: "他什么时候走？",
            meaning: "He's leaving when?",
            pinyin: "tā shénme shíhou zǒu?",
            emojiChallenge: "👦⌛❓🚶", // 👦(he) + ⌛❓(when) + 🏃‍♂️(leave)
          },
          {
            characters: "我们什么时候吃饭？",
            meaning: "We're eating when?",
            pinyin: "wǒmen shénme shíhou chīfàn?",
            emojiChallenge: "👥⌛❓🙂🍽️", // 👥(we) + ⌛❓(when) + 🍚(eat)
          },
          {
            characters: "她什么时候工作？",
            meaning: "She works when?",
            pinyin: "tā shénme shíhou gōngzuò?",
            emojiChallenge: "👩⌛❓💼", // 👩(she) + ⌛❓(when) + 💼(work)
          },
          {
            characters: "你们什么时候去北京？",
            meaning: "Ya'll are going to Bejing when?",
            pinyin: "nǐmen shénme shíhou qù Běijīng?",
            emojiChallenge: "👥⌛❓✈️🏯", // 👥(you all) + ⌛❓(when) + ✈️(go) + 🏯(Beijing)
          },
        ],
      },
    },
  });
}

main();
