import type { HskLevel } from "cms-data/drizzle/schema";
import { notFound } from "next/navigation";
import React from "react";
import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { phraseToAudioSource, wordToAudioSource } from "@/utils/idToAudioSource";
import { deDupe } from "@/utils/structureUtils";

type DrillIdentifier = {
  drillSlug: string;
  lessonSlug: string;
  courseSlug: string;
};

async function getAllWordsInLesson(lessonSlug: string) {
  const lesson = await getDrizzleClient().query.lesson.findFirst({
    where: (lessonTable, { eq }) => eq(lessonTable.slug, lessonSlug),
    columns: {
      title: true,
    },
    with: {
      course: {
        columns: {
          title: true,
        },
      },
      drills: {
        with: {
          drillToWords: {
            with: {
              word: true,
            },
          },
          drillToPhrases: {
            with: {
              phrase: {
                with: {
                  phraseWords: {
                    orderBy: (t, { asc }) => asc(t.order),
                    columns: {
                      order: true,
                    },
                    with: {
                      word: {
                        columns: {
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
      },
    },
  });
  if (lesson == null) notFound();
  return {
    courseTitle: lesson.course.title,
    lessonTitle: lesson.title,
    drillTitle: "Final Mastery",
    description: null,
    words: deDupe(
      lesson.drills.flatMap((drill) => drill.drillToWords.map((ele) => ele.word)),
      (ele) => ele.id,
    ),
    phrases: deDupe(
      lesson.drills.flatMap((drill) => drill.drillToPhrases.map((ele) => ele.phrase)),
      (ele) => ele.id,
    ),
  };
}
async function getAllWordsInDrill(drillSlug: string) {
  const drill = await getDrizzleClient().query.drill.findFirst({
    where: (t, { eq }) => eq(t.slug, drillSlug),
    columns: {
      title: true,
      description: true,
    },
    with: {
      drillToWords: {
        with: {
          word: true,
        },
      },
      drillToPhrases: {
        with: {
          phrase: {
            with: {
              phraseWords: {
                orderBy: (t, { asc }) => asc(t.order),
                columns: {
                  order: true,
                },

                with: {
                  word: {
                    columns: {
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
      lesson: {
        columns: {
          title: true,
        },
        with: {
          course: {
            columns: {
              title: true,
            },
          },
        },
      },
    },
  });
  if (drill == null) notFound();
  return {
    courseTitle: drill.lesson.course.title,
    lessonTitle: drill.lesson.title,
    drillTitle: drill.title,
    description: drill.description === "" ? null : drill.description,
    words: deDupe(
      drill.drillToWords.flatMap((ele) => ele.word),
      (ele) => ele.id,
    ),
    phrases: deDupe(
      drill.drillToPhrases.flatMap((ele) => ele.phrase),
      (ele) => ele.id,
    ),
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
  words: { characters: string; pinyin: string; id: number; meaning: string; hskLevel: HskLevel | null }[];
}
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
      ({ phraseWords, ...ele }): PhraseDefinition => ({
        ...ele,
        type: "phrase" as const,
        words: phraseWords.map(({ word }) => ({
          characters: word.characters,
          pinyin: word.pinyin,
          id: word.id,
          meaning: word.meaning,
          hskLevel: word.hskLevel,
        })),
        characters: phraseWords.map(({ word }) => word.characters).join(" "),
        pinyin: phraseWords.map(({ word }) => word.pinyin).join(" "),
        emojiChallenge: "",
        audioSrc: phraseToAudioSource(ele.id),
      }),
    ),
  };
});
