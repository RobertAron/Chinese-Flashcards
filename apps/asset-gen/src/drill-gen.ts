import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      title: "To think / want",
      lessonSlug: "core-verbs-2",
      slug: "common-verbs-10",
      order: 3,
      description: "",
      Phrases: {
        create: [
          {
            characters: "你想吃什么？",
            meaning: "What do you want to eat?",
            pinyin: "nǐ xiǎng chī shénme?",
            emojiChallenge: "👤💭🍽️❓",
          },
          {
            characters: "我想去中国。",
            meaning: "I want to go to China.",
            pinyin: "wǒ xiǎng qù zhōngguó.",
            emojiChallenge: "👤💭✈️🇨🇳",
          },
          {
            characters: "她在想什么？",
            meaning: "What is she thinking about?",
            pinyin: "tā zài xiǎng shénme?",
            emojiChallenge: "👧🤔❓",
          },
          {
            characters: "我想你了。",
            meaning: "I miss you.",
            pinyin: "wǒ xiǎng nǐ le.",
            emojiChallenge: "👤💭👤❤️",
          },
          {
            characters: "他不想做作业。",
            meaning: "He doesn't want to do homework.",
            pinyin: "tā bù xiǎng zuò zuòyè.",
            emojiChallenge: "👦🚫💭📚📝",
          },
          {
            characters: "你想喝咖啡吗？",
            meaning: "Do you want to drink coffee?",
            pinyin: "nǐ xiǎng hē kāfēi ma?",
            emojiChallenge: "👤💭☕❓",
          },
        ],
      },
    },
  });
}

main();