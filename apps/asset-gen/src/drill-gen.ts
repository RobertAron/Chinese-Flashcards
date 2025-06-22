import path from "node:path";
import { PrismaClient } from "prisma-ui/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });
  await prisma.drill.create({
    data: {
      title: "When?",
      lessonSlug: "core-verbs-2",
      slug: "common-verbs-8",
      order: 1,
      description: "",
      Phrases: {
        create: [
          {
            characters: "你说什么？",
            meaning: "You said what?",
            pinyin: "nǐ shuō shénme?",
            emojiChallenge: "👤🗣️❓", // 👤(you) + 🗣️(say) + ❓(what)
          },
          {
            characters: "他说中文。",
            meaning: "He speaks Chinese.",
            pinyin: "tā shuō zhōngwén.",
            emojiChallenge: "👦🗣️🇨🇳", // 👦(he) + 🗣️(speak) + 🇨🇳(Chinese)
          },
          {
            characters: "请再说一遍。",
            meaning: "Please again say once time (Please say it again)",
            pinyin: "qǐng zài shuō yí biàn.",
            emojiChallenge: "🙏🔁🗣️1️⃣", // 🙏(please) + 🔁(again) + 🗣️(say) + 1️⃣(one time)
          },
          {
            characters: "我不会说英文。",
            meaning: "I can't speak English.",
            pinyin: "wǒ bú huì shuō yīngwén.",
            emojiChallenge: "🙋‍♂️🚫🗣️🇬🇧", // 🙋‍♂️(I) + 🚫(can't) + 🗣️(speak) + 🇬🇧(English)
          },
          {
            characters: "老师说得很快。",
            meaning: "Teacher's speak very fast.",
            pinyin: "lǎoshī shuō de hěn kuài.",
            emojiChallenge: "👩‍🏫🗣️⚡", // 👩‍🏫(teacher) + 🗣️(speak) + ⚡(fast)
          },
        ],
      },
    },
  });
}

main();
