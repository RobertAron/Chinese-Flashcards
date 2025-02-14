import { PrismaClient } from "cms-db";
import { data } from "../words/part-1.js";
const client = new PrismaClient();

export const mostCommonWords = [
  {
    title: "Most Common Words Unit 1",
    order: 0,
    id: "most-common-words-unit-1",
    lessons: [
      { id: 1, type: "words", words: data.slice(0, 5) },
      { id: 2, type: "words", words: data.slice(5, 10) },
      { id: 3, type: "words", words: data.slice(10, 15) },
      { id: 4, type: "words", words: data.slice(15, 20) },
      {
        id: 5,
        type: "phrases",
        phrases: [
          {
            character: "我有一个",
            pinyin: "wǒ yǒu yī gè",
            meaning: "I have one (of something).",
          },
          {
            character: "我不在",
            pinyin: "wǒ bù zài",
            meaning: "I am not here.",
          },
          {
            character: "你也说",
            pinyin: "nǐ yě shuō",
            meaning: "You also say (something).",
          },
          {
            character: "他说了",
            pinyin: "tā shuō le",
            meaning: "He/She/It said (something).",
          },
          {
            character: "这就对",
            pinyin: "zhè jiù duì",
            meaning: "This is exactly right.",
          },
        ],
      },
      {
        id: 6,
        type: "phrases",
        phrases: [
          {
            character: "人们都",
            pinyin: "rén men dōu",
            meaning: "All the people.",
          },
          {
            character: "我要了",
            pinyin: "wǒ yào le",
            meaning: "I want (it) now.",
          },
          {
            character: "你会说",
            pinyin: "nǐ huì shuō",
            meaning: "You can speak.",
          },
          {
            character: "都不在",
            pinyin: "dōu bù zài",
            meaning: "None are here.",
          },
          {
            character: "我也会",
            pinyin: "wǒ yě huì",
            meaning: "I also can (do it).",
          },
        ],
      },
      {
        id: 7,
        type: "phrases",
        phrases: [
          {
            character: "他也要",
            pinyin: "tā yě yào",
            meaning: "He also wants (it).",
          },
          {
            character: "你说对了",
            pinyin: "nǐ shuō duì le",
            meaning: "You said it right.",
          },
          {
            character: "这有人",
            pinyin: "zhè yǒu rén",
            meaning: "There is someone here.",
          },
          {
            character: "我们都会",
            pinyin: "wǒ men dōu huì",
            meaning: "We all can (do it).",
          },
          {
            character: "不说了",
            pinyin: "bù shuō le",
            meaning: "Not talking anymore.",
          },
        ],
      },
    ],
  },
];

async function main() {
  client.topic.create({
    data: {
      title: "Most Common Words Unit 1",
      slug: "most-common-words-unit-1",
      challenges: {
        createMany: {
          data: {},
        },
      },
    },
  });
}

main();
