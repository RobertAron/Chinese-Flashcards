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
        characters: "你在看什么？",
        meaning: "What are you looking at?",
        pinyin: "nǐ zài kàn shénme?",
        emojiChallenge: "👤👇👀❓",
      },
      {
        characters: "我喜欢看书。",
        meaning: "I like to read books.",
        pinyin: "wǒ xǐhuān kàn shū.",
        emojiChallenge: "🙂❤️👀📖",
      },
      {
        characters: "晚上我看电视。",
        meaning: "I watch TV at night.",
        pinyin: "wǎnshàng wǒ kàn diànshì.",
        emojiChallenge: "🌙🙂👀📺",
      },
      {
        characters: "我看见老师了。",
        meaning: "I saw the teacher.",
        pinyin: "wǒ kànjiàn lǎoshī le.",
        emojiChallenge: "🙋‍♂️👀👩‍🏫",
      },
      {
        characters: "请你看一下这个。",
        meaning: "Please take a look at this.",
        pinyin: "qǐng nǐ kàn yíxià zhège.",
        emojiChallenge: "🙏👤👀👉",
      },
    ],
  });
}

main();
