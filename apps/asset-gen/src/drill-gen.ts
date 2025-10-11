import path from "node:path";
import { PrismaClient } from "vocab-db/prisma";

async function main() {
  const datasourceUrl = path.resolve(`${process.cwd()}/../www/local.db`);
  const prisma = new PrismaClient({
    datasourceUrl: `file:${datasourceUrl}`,
  });

  await prisma.phrases.createMany({
    data: [
      // 大 (big)
      {
        characters: "你 觉得 这 本 书 大 不 大？",
        meaning: "Do you think this book is big?",
        pinyin: "nǐ juéde zhè běn shū dà bù dà?",
        emojiChallenge: "📖❓",
      },
      {
        characters: "虽然 这个 房子 很 大， 但是 很 旧。",
        meaning: "Although this house is big, it’s old.",
        pinyin: "suīrán zhège fángzi hěn dà, dànshì hěn jiù.",
        emojiChallenge: "🏠➡️📏🏚️",
      },
      {
        characters: "他 比 我 大 两 岁。",
        meaning: "He is two years older than me.",
        pinyin: "tā bǐ wǒ dà liǎng suì.",
        emojiChallenge: "👦📈2️⃣🎂",
      },

      // 小 (small)
      {
        characters: "你 为什么 买 这么 小 的 桌子？",
        meaning: "Why did you buy such a small table?",
        pinyin: "nǐ wèishénme mǎi zhème xiǎo de zhuōzi?",
        emojiChallenge: "❓🛒🪑",
      },
      {
        characters: "我 妹妹 小 时候 住 在 北京。",
        meaning: "My younger sister lived in Beijing when she was small.",
        pinyin: "wǒ mèimei xiǎo shíhòu zhù zài Běijīng.",
        emojiChallenge: "👧🏙️⏪",
      },
      {
        characters: "这个 问题 不 小， 需要 认真 想。",
        meaning: "This problem isn’t small; it needs serious thought.",
        pinyin: "zhège wèntí bù xiǎo, xūyào rènzhēn xiǎng.",
        emojiChallenge: "❌📏🧠",
      },

      // 高 (tall/high)
      {
        characters: "你 哥哥 比 你 高 吗？",
        meaning: "Is your older brother taller than you?",
        pinyin: "nǐ gēge bǐ nǐ gāo ma?",
        emojiChallenge: "👨↔️📏❓",
      },
      {
        characters: "这 家 饭店 在 很 高 的 楼 上。",
        meaning: "This restaurant is on a very tall building.",
        pinyin: "zhè jiā fàndiàn zài hěn gāo de lóu shàng.",
        emojiChallenge: "🍜🏢⬆️",
      },
      {
        characters: "如果 山 太 高， 你 还 想 爬 吗？",
        meaning: "If the mountain is too high, do you still want to climb?",
        pinyin: "rúguǒ shān tài gāo, nǐ hái xiǎng pá ma?",
        emojiChallenge: "⛰️⬆️❓",
      },

      // 好 (good)
      {
        characters: "这 件 衣服 好看 吗？",
        meaning: "Does this piece of clothing look good?",
        pinyin: "zhè jiàn yīfu hǎokàn ma?",
        emojiChallenge: "👗👀❓",
      },
      {
        characters: "他 今天 心情 不 好， 所以 不 想 说话。",
        meaning: "He’s not in a good mood today, so he doesn’t want to talk.",
        pinyin: "tā jīntiān xīnqíng bù hǎo, suǒyǐ bù xiǎng shuōhuà.",
        emojiChallenge: "😔📅🗣️❌",
      },
      {
        characters: "学习 好 的 人 不 一定 高兴。",
        meaning: "People who study well aren’t always happy.",
        pinyin: "xuéxí hǎo de rén bù yīdìng gāoxìng.",
        emojiChallenge: "📚👍😕",
      },

      // 新 (new)
      {
        characters: "你 想 不 想 买 一 辆 新 车？",
        meaning: "Do you want to buy a new car?",
        pinyin: "nǐ xiǎng bù xiǎng mǎi yī liàng xīn chē?",
        emojiChallenge: "🚗🆕❓",
      },
      {
        characters: "我们 的 老师 教 了 一些 新 词。",
        meaning: "Our teacher taught some new words.",
        pinyin: "wǒmen de lǎoshī jiāo le yīxiē xīn cí.",
        emojiChallenge: "👩‍🏫📖🆕",
      },
      {
        characters: "虽然 手机 是 新 的， 可是 太 贵 了。",
        meaning: "Although the phone is new, it’s too expensive.",
        pinyin: "suīrán shǒujī shì xīn de, kěshì tài guì le.",
        emojiChallenge: "📱🆕💰❌",
      },

      // 重要 (important)
      {
        characters: "你 觉得 什么 更 重要， 时间 还是 钱？",
        meaning: "What do you think is more important, time or money?",
        pinyin: "nǐ juéde shénme gèng zhòngyào, shíjiān háishì qián?",
        emojiChallenge: "⏰💰❓",
      },
      {
        characters: "我 忘 了 一个 重要 的 名字。",
        meaning: "I forgot an important name.",
        pinyin: "wǒ wàng le yī gè zhòngyào de míngzi.",
        emojiChallenge: "🧠❌📝",
      },
      {
        characters: "如果 明天 有 重要 的 考试， 你 会 怎么办？",
        meaning: "If you have an important exam tomorrow, what will you do?",
        pinyin: "rúguǒ míngtiān yǒu zhòngyào de kǎoshì, nǐ huì zěnme bàn?",
        emojiChallenge: "📅📝❓",
      },

      // 高兴 (happy)
      {
        characters: "你 为什么 今天 不 高兴？",
        meaning: "Why are you unhappy today?",
        pinyin: "nǐ wèishénme jīntiān bù gāoxìng?",
        emojiChallenge: "❓😕📅",
      },
      {
        characters: "我们 一起 吃饭， 他 高兴 得 不得了。",
        meaning: "We ate together, and he was extremely happy.",
        pinyin: "wǒmen yīqǐ chīfàn, tā gāoxìng de bùdéliǎo.",
        emojiChallenge: "👥🍚😁",
      },
      {
        characters: "如果 你 来 了， 我 就 很 高兴。",
        meaning: "If you come, I’ll be very happy.",
        pinyin: "rúguǒ nǐ lái le, wǒ jiù hěn gāoxìng.",
        emojiChallenge: "🚶‍♂️➡️😊",
      },

      // 太 (too, excessively)
      {
        characters: "你 是不是 觉得 这 道 题 太 难 了？",
        meaning: "Do you think this question is too hard?",
        pinyin: "nǐ shì bù shì juéde zhè dào tí tài nán le?",
        emojiChallenge: "❓📖😖",
      },
      {
        characters: "他 工作 太 多， 所以 身体 不 好。",
        meaning: "He works too much, so his health is poor.",
        pinyin: "tā gōngzuò tài duō, suǒyǐ shēntǐ bù hǎo.",
        emojiChallenge: "💼⚡🤒",
      },
      {
        characters: "如果 天气 太 冷， 我们 就 不 去。",
        meaning: "If it’s too cold, then we won’t go.",
        pinyin: "rúguǒ tiānqì tài lěng, wǒmen jiù bù qù.",
        emojiChallenge: "❄️🥶🚫🚶",
      },
    ],
  });
}

main();
