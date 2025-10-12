import { notFound } from "next/navigation";
import React from "react";
import type { HskLevel } from "vocab-db/prisma";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { phraseToAudioSource, phraseToImageSource, wordToAudioSource } from "@/utils/idToAudioSource";
import { punctuation } from "@/utils/specialCharacters";
import { deDupe } from "@/utils/structureUtils";

type DrillIdentifier = {
  drillSlug: string;
  lessonSlug: string;
  courseSlug: string;
};

async function getAllWordsInLesson(lessonSlug: string) {
  const lesson = await getPrismaClient().lesson.findFirst({
    where: {
      slug: lessonSlug,
    },
    select: {
      title: true,
      Course: {
        select: {
          title: true,
        },
      },
      Drill: {
        select: {
          Words: true,
          Phrases: {
            select: {
              id: true,
              meaning: true,
              PhraseWords: {
                orderBy: {
                  order: "asc",
                },
                select: {
                  word: {
                    select: {
                      characters: true,
                      pinyin: true,
                      id: true,
                      meaning: true,
                      hskLevel: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (lesson == null) notFound();
  return {
    courseTitle: lesson.Course.title,
    lessonTitle: lesson.title,
    drillTitle: "Final Mastery",
    description: null,
    words: deDupe(
      lesson.Drill.flatMap((drill) => drill.Words),
      (ele) => ele.id,
    ),
    phrases: deDupe(
      lesson.Drill.flatMap((drill) => drill.Phrases),
      (ele) => ele.id,
    ),
  };
}
async function getAllWordsInDrill(drillSlug: string) {
  const drill = await getPrismaClient().drill.findFirst({
    where: {
      slug: drillSlug,
    },
    select: {
      title: true,
      description: true,
      Words: true,
      Lesson: {
        select: {
          title: true,
          Course: {
            select: {
              title: true,
            },
          },
        },
      },
      Phrases: {
        select: {
          id: true,
          meaning: true,
          PhraseWords: {
            orderBy: {
              order: "asc",
            },
            select: {
              word: {
                select: {
                  characters: true,
                  pinyin: true,
                  id: true,
                  meaning: true,
                  hskLevel: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (drill == null) notFound();
  return {
    courseTitle: drill.Lesson.Course.title,
    lessonTitle: drill.Lesson.title,
    drillTitle: drill.title,
    description: drill.description === "" ? null : drill.description,
    words: deDupe(drill.Words, (ele) => ele.id),
    phrases: deDupe(drill.Phrases, (ele) => ele.id),
  };
}

export type DrillInfo = Awaited<ReturnType<typeof getDrillInfo>>;

type DefinitionCore = {
  id: number;
  characters: string;
  pinyin: string;
  meaning: string;
  audioSrc: string;
  emojiChallenge: string | null;
};

export interface WordDefinition extends DefinitionCore {
  type: "word";
  hskLevel: HskLevel | null;
}

export interface PhraseDefinition extends DefinitionCore {
  type: "phrase";
  imageSrc: string;
  words: { characters: string; pinyin: string; id: number; meaning: string; hskLevel: HskLevel | null }[];
}
const spacePunctuation = new RegExp(` (?=${punctuation.source})`, "g");
export const getDrillInfo = React.cache(async function c(params: DrillIdentifier) {
  const data = await (params.drillSlug.startsWith("final-mastery")
    ? getAllWordsInLesson(params.lessonSlug)
    : getAllWordsInDrill(params.drillSlug));
  return {
    ...data,
    words: data.words.map(
      (ele): WordDefinition => ({
        ...ele,
        type: "word" as const,
        audioSrc: wordToAudioSource(ele.id),
      }),
    ),
    phrases: data.phrases.map(
      ({ PhraseWords, ...ele }): PhraseDefinition => ({
        ...ele,
        type: "phrase" as const,
        words: PhraseWords.map(({ word }) => ({
          characters: word.characters,
          pinyin: word.pinyin,
          id: word.id,
          meaning: word.meaning,
          hskLevel: word.hskLevel,
        })).filter((ele) => !punctuation.test(ele.characters)),
        characters: PhraseWords.map(({ word }) => word.characters)
          .join(" ")
          .replaceAll(spacePunctuation, " ")
          .trim(),
        pinyin: PhraseWords.map(({ word }) => word.pinyin)
          .join(" ")
          .replaceAll(spacePunctuation, "")
          .trim(),
        audioSrc: phraseToAudioSource(ele.id),
        emojiChallenge: null,
        imageSrc: phraseToImageSource(ele.id),
      }),
    ),
  };
});
