import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });

  // Drill 1: 厕所 & 酒店
  await prisma.drill.create({
    data: {
      slug: "places-locations-5",
      title: "Toilet, Hotel",
      lessonSlug: "places-nouns",
      description: "",
      Phrases: {
        create: [
          {
            characters: "厕所 在 哪儿？",
            meaning: "Where is the toilet?",
            pinyin: "cèsuǒ zài nǎr?",
            emojiChallenge: "🚻❓",
          },
          {
            characters: "厕所 在 楼上。",
            meaning: "The toilet is upstairs.",
            pinyin: "cèsuǒ zài lóushàng.",
            emojiChallenge: "🚻⬆️🏠",
          },
          {
            characters: "厕所 很 干净。",
            meaning: "The toilet is very clean.",
            pinyin: "cèsuǒ hěn gānjìng.",
            emojiChallenge: "🚻✨",
          },
          {
            characters: "酒店 很 贵。",
            meaning: "The hotel is expensive.",
            pinyin: "jiǔdiàn hěn guì.",
            emojiChallenge: "🏨💰",
          },
          {
            characters: "我们 住 在 酒店。",
            meaning: "We are staying at the hotel.",
            pinyin: "wǒmen zhù zài jiǔdiàn.",
            emojiChallenge: "👥🏨🛏️",
          },
          {
            characters: "酒店 前 有 出租车。",
            meaning: "There are taxis in front of the hotel.",
            pinyin: "jiǔdiàn qián yǒu chūzūchē.",
            emojiChallenge: "🏨🚖🚖",
          },
        ],
      },
    },
  });

  // Drill 2: 超市 & 后边
  await prisma.drill.create({
    data: {
      slug: "places-locations-6",
      title: "Supermarket, Behind",
      lessonSlug: "places-nouns",
      description: "",
      Phrases: {
        create: [
          {
            characters: "我 去 超市 买 米。",
            meaning: "I’m going to the supermarket to buy rice.",
            pinyin: "wǒ qù chāoshì mǎi mǐ.",
            emojiChallenge: "🙂🏃‍♂️🏪🍚",
          },
          {
            characters: "超市 里 有 冰淇淋。",
            meaning: "There is ice cream in the supermarket.",
            pinyin: "chāoshì lǐ yǒu bīngqílín.",
            emojiChallenge: "🏪🍦",
          },
          {
            characters: "超市 开 到 十点。",
            meaning: "The supermarket is open until ten.",
            pinyin: "chāoshì kāi dào shí diǎn.",
            emojiChallenge: "🏪🕙",
          },
          {
            characters: "老师 在 我 后边。",
            meaning: "The teacher is behind me.",
            pinyin: "lǎoshī zài wǒ hòubian.",
            emojiChallenge: "👩‍🏫🙂⬅️",
          },
          {
            characters: "山 在 城市 后边。",
            meaning: "The mountain is behind the city.",
            pinyin: "shān zài chéngshì hòubian.",
            emojiChallenge: "🏔️🏙️⬅️",
          },
          {
            characters: "猫 在 桌子 后边。",
            meaning: "The cat is behind the table.",
            pinyin: "māo zài zhuōzi hòubian.",
            emojiChallenge: "🐱🪑⬅️",
          },
        ],
      },
    },
  });
}

main();