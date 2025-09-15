import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      slug: "places-locations-2",
      title: "Company, Park, Nearby",
      lessonSlug: "places-nouns",
      description: "",
      Phrases: {
        create: [
          {
            characters: "我 有 一个 公司。",
            meaning: "I own a company.",
            pinyin: "wǒ yǒu yí gè gōngsī.",
            emojiChallenge: "🙂⊢1️⃣🏢",
          },
          {
            characters: "他 今天 去 公司",
            meaning: "He is today going to the company",
            pinyin: "tā jīntiān qù gōngsī.",
            emojiChallenge: "🧑📅🏃‍♂️🏢",
          },
          {
            characters: "我们 在 公园 玩。",
            meaning: "We are at the park playing.",
            pinyin: "wǒmen zài gōngyuán wán.",
            emojiChallenge: "🙂👥📍🌳⚽",
          },
          {
            characters: "公园 非常 大",
            meaning: "The park is extremely big.",
            pinyin: "gōngyuán fēicháng dà.",
            emojiChallenge: "🌳⇈⛰",
          },
          {
            characters: "银行 在 学校 附近。",
            meaning: "The bank and school are nearby",
            pinyin: "yínháng zài xuéxiào fùjìn.",
            emojiChallenge: "🏦🏫👣",
          },
          {
            characters: "这 附近 有 饭店 吗？",
            meaning: "This nearby, has a restaurant?",
            pinyin: "zhè fùjìn yǒu fàndiàn ma?",
            emojiChallenge: "👇👣⊢🍜❓",
          },
        ],
      },
    },
  });
}

main();