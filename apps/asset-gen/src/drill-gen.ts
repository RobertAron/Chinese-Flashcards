import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      slug: "people-adjectives-2",
      title: "adjective 1",
      lessonSlug: "people-adjectives",
      description:
        "Typically the way to apply an adjective is `(subject) (很/好) (adjective)`. In these situations, a closer literal translations of these words would be `is`. 好 can be used to mean something is good, or something is very. In fact, someone can even be 好好. This is sort of like saying someone is 'pretty pretty'.",
      Phrases: {
        create: [
          {
            characters: "他 今天 很 忙。",
            meaning: "He is very busy today.",
            pinyin: "tā jīntiān hěn máng.",
            emojiChallenge: "👦📅🕒",
          },
          {
            characters: "小猫 很 聪明。",
            meaning: "The kitten is very smart.",
            pinyin: "xiǎomāo hěn cōngmíng.",
            emojiChallenge: "🐱🧠✨",
          },
          {
            characters: "这个 苹果 好 大。",
            meaning: "This apple is very big.",
            pinyin: "zhège píngguǒ hǎo dà.",
            emojiChallenge: "🍎👀📏",
          },
          {
            characters: "这个 苹果 很 好。",
            meaning: "This apple is good.",
            pinyin: "zhège píngguǒ hěn hǎo.",
            emojiChallenge: "🍎👍😊",
          },
          {
            characters: "小朋友 很 聪明 会 说 汉语。",
            meaning: "The kids are smart, (they) can speak Chinese.",
            pinyin: "xiǎopéngyǒu hěn cōngmíng huì shuō hànyǔ.",
            emojiChallenge: "👧👦🗣️🀄",
          },
        ],
      },
    },
  });
}

main();
