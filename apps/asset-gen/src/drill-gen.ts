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
        characters: "他 是 中国 的 学生。",
        meaning: "He is a Chinese student",
        pinyin: "tā shì Zhōngguó de xuéshēng.",
        emojiChallenge: "👤➡️🇨🇳🎓",
      },
      {
        characters: "学校 里 有 很多 学生。",
        meaning: "The school's inside has many students",
        pinyin: "xuéxiào lǐ yǒu hěn duō xuéshēng.",
        emojiChallenge: "🏫📍🎓🎓🎓",
      },
      {
        characters: "她 是 我们 学校 的 老师。",
        meaning: "She is a our school's teacher",
        pinyin: "tā shì wǒmen xuéxiào de lǎoshī.",
        emojiChallenge: "👩➡️🏫👩‍🏫",
      },
      {
        characters: "老师 在 教 学生 中文。",
        meaning: "The teacher is currently teaching students Chinese.",
        pinyin: "lǎoshī zài jiāo xuéshēng Zhōngwén.",
        emojiChallenge: "👩‍🏫📚🎓🇨🇳",
      },
      {
        characters: "他 是 我 最好 的 同学。",
        meaning: "He is my best classmate.",
        pinyin: "tā shì wǒ zuìhǎo de tóngxué.",
        emojiChallenge: "👤➡️🤝🎓💯",
      },
      {
        characters: "我 和 同学 一起 吃 午饭。",
        meaning: "I, and classmates together, eat lunch",
        pinyin: "wǒ hé tóngxué yīqǐ chī wǔfàn.",
        emojiChallenge: "👤🤝🎓🍚☀️",
      },
    ],
  });
}

main();
