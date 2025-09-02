import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      slug: "people-adjectives-4",
      title: "Tired and Fast",
      lessonSlug: "people-adjectives",
      description: "累 means tired, while 快 can mean fast or soon.",
      Phrases: {
        create: [
          // 累
          {
            characters: "我 很 累。",
            meaning: "I am very tired.",
            pinyin: "wǒ hěn lèi.",
            emojiChallenge: "🙂😴",
          },
          {
            characters: "他 走 路 走 得 很 累。",
            meaning: "He got very tired from walking.",
            pinyin: "tā zǒulù zǒu de hěn lèi.",
            emojiChallenge: "🚶😓",
          },
          {
            characters: "她 学习 一 天，很 累。",
            meaning: "She studied all day and is tired.",
            pinyin: "tā xuéxí yī tiān, hěn lèi.",
            emojiChallenge: "📖🕐😩",
          },
          // 快
          {
            characters: "他 跑 得 很 快。",
            meaning: "He runs very fast.",
            pinyin: "tā pǎo de hěn kuài.",
            emojiChallenge: "🏃💨",
          },
          {
            characters: "快 来！",
            meaning: "Come quickly!",
            pinyin: "kuài lái!",
            emojiChallenge: "👉🏃",
          },
          {
            characters: "我们 快 到 家 了。",
            meaning: "We are almost home.",
            pinyin: "wǒmen kuài dào jiā le.",
            emojiChallenge: "🚗🏠🙂",
          },
        ],
      },
    },
  });
}

main();
