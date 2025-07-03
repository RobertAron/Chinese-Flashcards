import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      title: "To come",
      lessonSlug: "core-verbs-2",
      slug: "common-verbs-9",
      order: 2,
      description: "",
      Phrases: {
        create: [
          {
            characters: "你来中国了吗？",
            meaning: "Did you come to China?",
            pinyin: "nǐ lái zhōngguó le ma?",
            emojiChallenge: "👤🛬🇨🇳",
          },
          {
            characters: "他今天不来学校。",
            meaning: "He's not coming to school today.",
            pinyin: "tā jīntiān bù lái xuéxiào.",
            emojiChallenge: "👦📅🚫🛬🏫",
          },
          {
            characters: "你几点来？",
            meaning: "What time are you coming?",
            pinyin: "nǐ jǐ diǎn lái?",
            emojiChallenge: "👤⏰❓🛬",
          },
          {
            characters: "请你来这儿。",
            meaning: "Please come here.",
            pinyin: "qǐng nǐ lái zhèr.",
            emojiChallenge: "🙏👤🛬📍",
          },
          {
            characters: "老师来了！",
            meaning: "The teacher came!",
            pinyin: "lǎoshī lái le!",
            emojiChallenge: "👩‍🏫🛬❗",
          },
          {
            characters: "明天她来我家。",
            meaning: "She is coming to my house tomorrow.",
            pinyin: "míngtiān tā lái wǒ jiā.",
            emojiChallenge: "📆👧🛬🏠",
          },
        ],
      },
    },
  });
}

main();