"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { WordOutline } from "@/components/challenges/WordOutline";
import { formatTimeAttackMs } from "@/utils/playerStats";
import { match } from "ts-pattern";
import { usePracticeCount, useTimeAttackPB } from "../../../utils/playerStats";
import { ListChecks, Timer } from "lucide-react";
import { MotionLink } from "@/components/MotionLink";
import { TargetAndTransition } from "motion/react";
import { ExitLink } from "./ExitButton";

const whileHocus: TargetAndTransition = {
  scale: 1.1,
  rotate: 1,
};

function ModeOption({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <MotionLink
      whileHover={whileHocus}
      whileFocus={whileHocus}
      transition={{ duration: 0.1 }}
      href={href}
      className="group flex basis-0 flex-shrink-0 flex-grow origin-center items-center gap-8 rounded-lg border-2 border-black bg-white p-4 hocus:bg-black hocus:text-white"
    >
      {children}
    </MotionLink>
  );
}

export default AppPage(() => {
  const { challengeId, wordDefinitions, challengeLabel } =
    useChallengeContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <main className="flex flex-col items-start gap-8 p-1">
      <h1 className="text-3xl font-bold underline">{challengeLabel}</h1>
      <ExitLink href="/challenge-list" />
      <section className="flex w-full flex-col gap-2">
        <h2 className="text-4xl font-bold text-blue-700">Select Mode</h2>
        <div className="flex gap-4 flex-wrap">
          <ModeOption href={`/challenge-list/${challengeId}/practice`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <ListChecks className="h-full w-full" />
            </div>
            <div>
              <div className="text-4xl">Practice</div>
              <div className="text-4xl">(x{practiceCount})</div>
            </div>
          </ModeOption>
          <ModeOption href={`/challenge-list/${challengeId}/time-attack`}>
            <div className="h-32 w-32 flex-shrink-0 rounded-full bg-black p-4 text-white group-hocus:bg-white group-hocus:text-black">
              <Timer className="h-full w-full" />
            </div>
            <div>
              <div className="text-4xl whitespace-nowrap">Time Attack</div>
              <div className="text-4xl whitespace-nowrap">
                {match(timeAttackPb)
                  .with(null, () => "Not Completed")
                  .otherwise((pb) => (
                    <span>
                      <span className="font-semibold">PB:</span>
                      <span>{formatTimeAttackMs(pb)}</span>
                    </span>
                  ))}
              </div>
            </div>
          </ModeOption>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">WORDS</h2>
        <div className="flex flex-wrap gap-2 [&>*]:flex-grow">
          {wordDefinitions.map((word) => (
            <WordOutline word={word} key={word.id} />
          ))}
        </div>
      </section>
    </main>
  );
});
