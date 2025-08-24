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
        characters: "别人 在 学校 学汉语。",
        meaning: "Other people are studying Chinese at school.",
        pinyin: "biéren zài xuéxiào xué hànyǔ.",
        emojiChallenge: "👥📍🏫📚🀄",
      },
      {
        characters: "别人 喜欢 吃 米饭。",
        meaning: "Other people like to eat rice.",
        pinyin: "biéren xǐhuan chī mǐfàn.",
        emojiChallenge: "👥❤️🍽️🍚",
      },
      {
        characters: "小朋友 在 公园 玩。",
        meaning: "The little kids at the park are playing.",
        pinyin: "xiǎopéngyǒu zài gōngyuán wán.",
        emojiChallenge: "👧👦🌳⚽",
      },
      {
        characters: "小朋友 喜欢 看书。",
        meaning: "The little kids like reading books.",
        pinyin: "xiǎopéngyǒu xǐhuan kàn shū.",
        emojiChallenge: "👧👦📚😊",
      },
      {
        characters: "小朋友 在 家 画画。",
        meaning: "The little kids at home are drawing",
        pinyin: "xiǎopéngyǒu zài jiā huàhuà.",
        emojiChallenge: "👧👦📍🏠🎨",
      },
    ],
  });
}

main();
