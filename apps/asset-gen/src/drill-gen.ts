import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      title: "Which? (HSK1)",
      slug: "asking-questions-10",
      lessonSlug: "core-questions-2",
      order: 7,
      description: "",
      Phrases: {
        create: [
          {
            characters: "你要哪个？",
            meaning: "You intend which one?",
            pinyin: "nǐ yào nǎ ge?",
            emojiChallenge: "👤🎯⌥📦", // 👤(you) + 🎯(want) + ❓(which) + 📦(one)
          },
          {
            characters: "这是哪个？",
            meaning: "this is Which one?",
            pinyin: "zhè shì nǎ ge?",
            emojiChallenge: "👇🟰⌥📦", // 🖐️(this) + 🟰(is) + ❓(which) + 📦(one)
          },
          {
            characters: "哪个好？",
            meaning: "Which one is good?",
            pinyin: "nǎ ge hǎo?",
            emojiChallenge: "⌥📦👍", // ❓(which) + 📦(one) + 👍(good)
          },
          {
            characters: "你选哪个？",
            meaning: "You pick which one?",
            pinyin: "nǐ xuǎn nǎ ge?",
            emojiChallenge: "👤✌️⌥📦", // 👤(you) + ✌️(pick) + ❓(which) + 📦(one)
          },
          {
            characters: "哪个是你的？",
            meaning: "Which one is yours?",
            pinyin: "nǎ ge shì nǐ de?",
            emojiChallenge: "⌥📦🟰👤🔗", // ❓(which) + 📦(one) + 🟰(is) + 👤(your) + 📌(的)
          },
        ],
      },
    },
  });
}

main();
