import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  const commonWords = await prisma.words.findMany({
    take: 150,
    orderBy: {
      frequencyRank: "asc",
    },
  });
  await prisma.drill.create({
    data: {
      title: "What is",
      slug: "common-verbs-7",
      lessonSlug: "core-verbs-1",
      order: 6,
      description: "",
      Phrases: {
        create: [
          {
            characters: "我 是 美国人",
            meaning: "I’m American.",
            pinyin: "wǒ shì měiguó rén",
            emojiChallenge: "🙂🟰🇺🇸👤",
          },
          {
            characters: "今天 是 星期五",
            meaning: "Today is Friday.",
            pinyin: "jīntiān shì xīngqīwǔ",
            emojiChallenge: "📅🟰5️⃣",
          },
          {
            characters: "这 不是 我 的 手机",
            meaning: "This is not my phone.",
            pinyin: "zhè bú shì wǒ de shǒujī",
            emojiChallenge: "📍🚫🟰🙂📎📱",
          },
          {
            characters: "你 是 中国 人 吗？",
            meaning: "Are you Chinese?",
            pinyin: "nǐ shì zhōngguó rén ma?",
            emojiChallenge: "👤🟰🇨🇳❓",
          },
          {
            characters: "这 是 你 的 书 吗？",
            meaning: "Is this your book?",
            pinyin: "zhè shì nǐ de shū ma?",
            emojiChallenge: "📍🟰👤📎📖❓",
          },
          {
            characters: "我 是 你 的 朋友",
            meaning: "I’m your friend.",
            pinyin: "wǒ shì nǐ de péngyǒu",
            emojiChallenge: "🙂🟰👤📎🤝",
          },
        ],
      },
    },
  });

  console.log(JSON.stringify(commonWords));
}

main();
