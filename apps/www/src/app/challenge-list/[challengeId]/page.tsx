"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { WordOutline } from "@/components/challenges/WordOutline";
import { formatPracticeCount, formatTimeAttackMs } from "@/utils/playerStats";
import { usePracticeCount, useTimeAttackPB } from "../../../utils/playerStats";
import { ListChecks, Timer } from "lucide-react";
import { ExitLink } from "./ExitButton";
import { twistBehaviorClasses } from "@/components/coreClasses";
import Link from "next/link";
import * as motion from "motion/react-client";

function ModeOption({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-shrink-0 flex-grow basis-0 origin-center items-center gap-4 rounded-lg border-2 border-black bg-white p-3 hocus:bg-black hocus:text-white ${twistBehaviorClasses}`}
    >
      {children}
    </Link>
  );
}

export default AppPage(() => {
  const { challengeId, wordDefinitions, challengeLabel } =
    useChallengeContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <main className="flex flex-col items-start gap-4 p-1">
      <h1 className="text-3xl font-bold underline">{challengeLabel}</h1>
      <ExitLink href="/challenge-list" />
      <section className="flex w-full flex-col gap-2">
        <h2 className="text-4xl font-bold text-blue-700">Select Mode</h2>
        <div className="flex flex-wrap gap-4">
          <ModeOption href={`/challenge-list/${challengeId}/practice`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <ListChecks className="h-full w-full" />
            </div>
            <div>
              <div className="text-6xl">Practice</div>
              <div className="text-4xl">
                {formatPracticeCount(practiceCount)}
              </div>
            </div>
          </ModeOption>
          <ModeOption href={`/challenge-list/${challengeId}/time-attack`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <Timer className="h-full w-full" />
            </div>
            <div>
              <div className="whitespace-nowrap text-6xl">Time Attack</div>
              <div className="whitespace-nowrap text-4xl">
                {formatTimeAttackMs(timeAttackPb)}
              </div>
            </div>
          </ModeOption>
        </div>
      </section>
      <section className="flex w-full flex-col gap-2">
        <h2 className="text-2xl font-semibold">WORDS</h2>
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
    </main>
  );
});
