import type { ChallengeDefinition } from "./types.js";

export const manualChallenges: Record<string, ChallengeDefinition> = {
  "where-is-he": {
    label: "Where Is He 🤨",
    words: [
      {
        character: "他在哪儿",
        definition: "Where is he? 🤨",
        id: "where-is-he",
        pinyin: "tā zài nǎr",
        fileName: "where-is-he.mp3",
      },
      {
        character: "他在这儿",
        definition: "He is here! 👇",
        id: "he-is-here",
        pinyin: "tā zài zhèr",
        fileName: "he-is-here.mp3",
      },
      {
        character: "他在那儿",
        definition: "He is there! 👆",
        id: "he-is-there",
        pinyin: "tā zài nàr",
        fileName: "he-is-there.mp3",
      },
      {
        character: "你叫什么名字",
        definition: "What is your name? 🤔",
        id: "what-is-your-name",
        pinyin: "nǐ jiào shénme míngzì?",
        fileName: "what-is-your-name.mp3",
      },
      {
        character: "我叫张伟",
        definition: "My name is Zhang Wei. 🙋‍♂️",
        id: "my-name-is-zhang-wei",
        pinyin: "wǒ jiào Zhāng Wěi",
        fileName: "my-name-is-zhang-wei.mp3",
      },
    ],
  },
};
