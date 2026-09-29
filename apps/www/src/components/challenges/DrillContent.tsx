"use client";
import { BrainIcon } from "lucide-react";
import * as m from "motion/react-m";
import { useMemo } from "react";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { WordOutline } from "@/components/challenges/WordOutline";
import { WordExperience } from "@/components/challenges/WordPoints";
import { deDupe } from "@/utils/structureUtils";

export function DrillContent() {
  const { wordDefinitions, phraseDefinitions, description } = useDrillContext();
  const allWords = useMemo(() => {
    const wordsRaw = wordDefinitions.map(({ id, pinyin, characters, meaning, hskLevel, canonicalWord }) => ({
      id,
      pinyin,
      characters,
      meaning,
      hskLevel,
      canonicalWord,
    }));
    const wordsUsed = phraseDefinitions.flatMap(({ words }) => words);
    return deDupe([...wordsRaw, ...wordsUsed], ({ id }) => id);
  }, [wordDefinitions, phraseDefinitions]);
  return (
    <>
      {description !== null && (
        <m.section
          className="w-full rounded-md border-2 border-black bg-blue-50"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.1,
          }}
        >
          <div className="flex flex-col gap-1 rounded-sm border-blue-500 border-l-8 p-2">
            <h6 className="flex items-center gap-2 text-2xl">
              <span>Description</span>
            </h6>
            <p className="text-xl">{description}</p>
          </div>
        </m.section>
      )}
      <m.section
        className="w-full rounded-md border-2 border-black bg-blue-50"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.1,
        }}
      >
        <div className="flex flex-col gap-1 rounded-sm border-blue-500 border-l-8 p-2">
          <h6 className="flex items-center gap-2 text-2xl">
            <BrainIcon className="inline-block" />
            <span>Reminder!</span>
          </h6>
          <p className="text-xl">
            Go through every item and speak with the audio until you're comfortable speaking the content.
          </p>
        </div>
      </m.section>
      {wordDefinitions.length > 0 && (
        <section className="flex w-full flex-col gap-2">
          <h2 className="font-semibold text-2xl">Practice Words</h2>
          <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
            {wordDefinitions.map((word, index) => (
              <m.li
                key={word.id}
                initial={{
                  y: 50,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.02 * index,
                  },
                }}
                className="flex *:w-full"
              >
                <WordOutline word={word} />
              </m.li>
            ))}
          </ul>
        </section>
      )}
      {phraseDefinitions.length > 0 && (
        <section className="flex w-full flex-col gap-2">
          <h2 className="font-semibold text-2xl">Phrases</h2>
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {phraseDefinitions.map((phrase, index) => (
              <m.li
                key={phrase.id}
                initial={{
                  y: 50,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.02 * index,
                  },
                }}
                className="flex"
              >
                <WordOutline word={phrase} />
              </m.li>
            ))}
          </ul>
        </section>
      )}
      <section className="flex w-full flex-col gap-2">
        <h2 className="font-semibold text-2xl">All Words</h2>
        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allWords.map((ele) => (
            <li key={ele.id}>
              <WordExperience {...ele} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
