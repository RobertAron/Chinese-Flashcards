import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      slug: "places-locations-3",
      title: "Bank, Airport, Shop",
      lessonSlug: "places-nouns",
      description: "",
      Phrases: {
        create: [
          {
            characters: "银行 在 学校 附近。",
            meaning: "The bank is near the school.",
            pinyin: "yínháng zài xuéxiào fùjìn.",
            emojiChallenge: "🏦📍🏫",
          },
          {
            characters: "我 去 银行 取钱。",
            meaning: "I go to the bank to withdraw money.",
            pinyin: "wǒ qù yínháng qǔqián.",
            emojiChallenge: "🙂🏃‍♂️🏦💰",
          },
          {
            characters: "我们 去 机场。",
            meaning: "We are going to the airport.",
            pinyin: "wǒmen qù jīchǎng.",
            emojiChallenge: "👥🏃‍♂️✈️",
          },
          {
            characters: "机场 有 很多 出租车。",
            meaning: "There are many taxis at the airport.",
            pinyin: "jīchǎng yǒu hěn duō chūzūchē.",
            emojiChallenge: "✈️🚖🚖🚖",
          },
          {
            characters: "我 在 商店 买 水果。",
            meaning: "I am buying fruit at the shop.",
            pinyin: "wǒ zài shāngdiàn mǎi shuǐguǒ.",
            emojiChallenge: "🙂📍🏪🍎🍌",
          },
          {
            characters: "这个 商店 的 衣服 很 漂亮。",
            meaning: "The clothes in this shop are very pretty.",
            pinyin: "zhè gè shāngdiàn de yīfu hěn piàoliang.",
            emojiChallenge: "👇🏪👗✨",
          },
        ],
      },
    },
  });
}

main();
