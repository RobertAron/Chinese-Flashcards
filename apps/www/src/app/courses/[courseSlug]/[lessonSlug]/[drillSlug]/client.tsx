"use client";
import { MotionLink } from "@/components/MotionLink";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { WordOutline } from "@/components/challenges/WordOutline";
import { WordExperience } from "@/components/challenges/WordPoints";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import {
  formatPracticeCount,
  formatTimeAttackMs,
  usePracticeCount,
  useTimeAttackPB,
} from "@/utils/playerState";
import { deDupe } from "@/utils/structureUtils";
import { ListChecks, Timer } from "lucide-react";
import * as motion from "motion/react-client";
import { useMemo } from "react";

function ModeOption({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <MotionLink
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ rotate: 1, scale: 1.05 }}
      whileFocus={{ rotate: 1, scale: 1.05 }}
      transition={{
        duration: 0.1,
      }}
      href={href}
      className={`group flex shrink grow items-center gap-4 p-3 hover:z-10 ${buttonBehaviorClasses}`}
    >
      {children}
    </MotionLink>
  );
}

const modeOptionIconClasses =
  "h-20 w-20 shrink-0 rounded-full bg-black p-2 md:p-4 text-white group-hocus:bg-white group-hocus:text-black sm:h-28 sm:w-28";
const modeOptionTitleClasses = "text-5xl truncate whitespace-nowrap sm:text-6xl";
const modeOptionSubtitleClasses = "truncate whitespace-nowrap sm:text-4xl text-2xl";
export function DrillHome() {
  const { challengeId, wordDefinitions, phraseDefinitions, courseSlug, lessonSlug, description } =
    useDrillContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  const allWords = useMemo(() => {
    const wordsRaw = wordDefinitions.map(({ id, pinyin, characters, meaning }) => ({
      id,
      pinyin,
      characters,
      meaning,
    }));
    const wordsUsed = phraseDefinitions.flatMap(({ words }) => words);
    return deDupe([...wordsRaw, ...wordsUsed], ({ id }) => id);
  }, [wordDefinitions, phraseDefinitions]);
  return (
    <>
      <section className="flex w-full flex-col gap-2">
        <div className="flex flex-col gap-4 lg:flex-row">
          <ModeOption href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}/practice`}>
            <div className={modeOptionIconClasses}>
              <ListChecks className="h-full w-full" />
            </div>
            <div className="w-0 grow">
              <div className={modeOptionTitleClasses}>Practice</div>
              <div className={modeOptionSubtitleClasses}>{formatPracticeCount(practiceCount)}</div>
            </div>
          </ModeOption>
          <ModeOption href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}/time-attack`}>
            <div className={modeOptionIconClasses}>
              <Timer className="h-full w-full" />
            </div>
            <div className="w-0 grow">
              <div className={modeOptionTitleClasses}>Time Attack</div>
              <div className={modeOptionSubtitleClasses}>{formatTimeAttackMs(timeAttackPb)}</div>
            </div>
          </ModeOption>
        </div>
      </section>
      {description !== null && (
        <section className="rounded-md border-2 border-black bg-white">
          <div className="rounded-sm border-blue-500 border-l-8 p-2">
            <h2 className="text-3xl">Description</h2>
            <p className="text-xl">{description}</p>
          </div>
        </section>
      )}
      {wordDefinitions.length > 0 && (
        <section className="flex w-full flex-col gap-2">
          <h2 className="font-semibold text-2xl">Practice Words</h2>
          <ul className="grid w-full gap-4">
            {wordDefinitions.map((word, index) => (
              <motion.li
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
                className="flex"
              >
                <WordOutline word={word} />
              </motion.li>
            ))}
          </ul>
        </section>
      )}
      {phraseDefinitions.length > 0 && (
        <section className="flex w-full flex-col gap-2">
          <h2 className="font-semibold text-2xl">Phrases</h2>
          <ul className="grid w-full gap-4">
            {phraseDefinitions.map((phrase, index) => (
              <motion.li
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
              </motion.li>
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
