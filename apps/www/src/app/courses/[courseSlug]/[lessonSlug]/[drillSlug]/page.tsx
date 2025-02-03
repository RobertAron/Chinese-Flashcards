"use client"
import { AppServerEntrypoint } from "@/components/AppPage";
import { MotionLink } from "@/components/MotionLink";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { WordOutline } from "@/components/challenges/WordOutline";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import {
  formatPracticeCount,
  formatTimeAttackMs,
  usePracticeCount,
  useTimeAttackPB,
} from "@/utils/playerStats";
import { ListChecks, Timer } from "lucide-react";
import * as motion from "motion/react-client";
import { ExitLink } from "./ExitButton";

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
      whileHover={{ rotate: 1, scale: 1.1 }}
      whileFocus={{ rotate: 1, scale: 1.1 }}
      transition={{
        duration: 0.1,
      }}
      href={href}
      className={`group flex flex-grow basis-0 items-center gap-4 p-3 hover:z-10 ${buttonBehaviorClasses}`}
    >
      {children}
    </MotionLink>
  );
}
export default AppServerEntrypoint(() => {
  const { challengeId, wordDefinitions, challengeLabel } = useChallengeContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <motion.main className="flex flex-col items-start gap-4 p-1">
      <ExitLink href="/challenge-list" />
      <h1 className="font-bold text-3xl underline">{challengeLabel}</h1>
      <section className="flex w-full flex-col gap-2">
        <h2 className="font-bold text-4xl text-blue-700">Select Mode</h2>
        <div className="flex flex-wrap gap-4">
          <ModeOption href={`/challenge-list/${challengeId}/practice`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <ListChecks className="h-full w-full" />
            </div>
            <div>
              <div className="text-6xl">Practice</div>
              <div className="text-4xl">{formatPracticeCount(practiceCount)}</div>
            </div>
          </ModeOption>
          <ModeOption href={`/challenge-list/${challengeId}/time-attack`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <Timer className="h-full w-full" />
            </div>
            <div>
              <div className="whitespace-nowrap text-6xl">Time Attack</div>
              <div className="whitespace-nowrap text-4xl">{formatTimeAttackMs(timeAttackPb)}</div>
            </div>
          </ModeOption>
        </div>
      </section>
      <section className="flex w-full flex-col gap-2">
        <h2 className="font-semibold text-2xl">WORDS</h2>
        <ul className="grid w-full grid-cols-2 gap-4 xl:grid-cols-3">
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
            >
              <WordOutline word={word} />
            </motion.li>
          ))}
        </ul>
      </section>
    </motion.main>
  );
});
