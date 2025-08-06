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
        characters: "我知道他是谁。",
        meaning: "I know who he is.",
        pinyin: "wǒ zhīdào tā shì shéi.",
        emojiChallenge: "🙂🧠🧍❓",
      },
      {
        characters: "你知道这个吗？",
        meaning: "Do you know this?",
        pinyin: "nǐ zhīdào zhège ma?",
        emojiChallenge: "👤🧠👉❓",
      },
      {
        characters: "我们都知道。",
        meaning: "We all know.",
        pinyin: "wǒmen dōu zhīdào.",
        emojiChallenge: "👥🧠✅",
      },
      {
        characters: "老师知道答案。",
        meaning: "The teacher knows the answer.",
        pinyin: "lǎoshī zhīdào dá'àn.",
        emojiChallenge: "👩‍🏫🧠✅",
      },
      {
        characters: "他们不知道我在这儿。",
        meaning: "They don't know I'm here.",
        pinyin: "tāmen bù zhīdào wǒ zài zhèr.",
        emojiChallenge: "👥❌🧠🙋‍♂️📍",
      },
    ],
  });
}

main();
