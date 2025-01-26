"use client";
import { AppPage } from "@/components/AppPage";
import { PlayerAwardIcon } from "@/components/CompletionAward";
import { Challenge } from "@/components/challenges/Challenge";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { formatTimeAttackMs } from "@/utils/playerStats";
import { AnimatePresence, motion, useMotionValueEvent, useTime } from "motion/react";
import { useRef, useState } from "react";
import {
  timeAttackToAward,
  timeForBronze,
  timeForGold,
  timeForSilver,
  useTimeAttackPB,
} from "../../../../utils/playerStats";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

export default AppPage(() => {
  const [timeAttackRunning, setTimeAttackRunning] = useState(false);
  const { challengeId } = useChallengeContext();
  const [recentFinish, setRecentFinish] = useState<number | null>(null);
  const [previousBest, setNewBest] = useTimeAttackPB(challengeId);
  return (
    <main>
      {!timeAttackRunning ? (
        <ChallengeTitle onStart={() => setTimeAttackRunning(true)} improve={previousBest !== null}>
          <div className="flex gap-2">
            <div className="flex grow basis-0 flex-col text-3xl font-bold">
              <div className="flex items-center gap-1">
                <PlayerAwardIcon awardType="gold" /> {formatTimeAttackMs(timeForGold)}
              </div>
              <div className="flex items-center gap-1">
                <PlayerAwardIcon awardType="silver" /> {formatTimeAttackMs(timeForSilver)}
              </div>
              <div className="flex items-center gap-1">
                <PlayerAwardIcon awardType="bronze" /> {formatTimeAttackMs(timeForBronze)}
              </div>
            </div>
            <div className="flex grow basis-0 flex-col items-end text-lg">
              <div className="flex gap-1 truncate">
                <span>Previous Best:</span>
                <span className="flex items-center gap-1">
                  <PlayerAwardIcon awardType={timeAttackToAward(previousBest)} />
                  {formatTimeAttackMs(previousBest)}
                </span>
              </div>
              {recentFinish !== null && (
                <div className="flex items-end gap-1">
                  <div>Recent Finish</div>
                  <div className="flex items-end gap-1">
                    {recentFinish === previousBest && "🎉"}
                    <PlayerAwardIcon awardType={timeAttackToAward(recentFinish)} />
                    {formatTimeAttackMs(recentFinish)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ChallengeTitle>
      ) : (
        <TimeAttackRunning
          onTimeAttackComplete={(completedTime) => {
            setTimeAttackRunning(false);
            if (completedTime === null) return;
            setRecentFinish(completedTime);
            if (previousBest === null || completedTime < previousBest) setNewBest(completedTime);
          }}
        />
      )}
    </main>
  );
});

const itemsToComplete = 20;
function TimeAttackRunning({
  onTimeAttackComplete,
}: {
  onTimeAttackComplete: (completedTime: number | null) => void;
}) {
  const [completedItems, setCompletedItems] = useState(0);
  const { problem, nextProblem, initializing } = useChallengeStream();
  const time = useTime();
  const timerRef = useRef<HTMLDivElement>(null!);
  useMotionValueEvent(time, "change", (val) => {
    if (timerRef.current === null) return;
    timerRef.current.textContent = (val / 1000).toFixed(2);
  });
  if (initializing) return null;

  const onProblemComplete = () => {
    if (completedItems === itemsToComplete - 1) onTimeAttackComplete(time.get());
    else {
      setCompletedItems(completedItems + 1);
      nextProblem();
    }
  };

  return (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle grid-stack">
      <div className="justify-start self-start p-2 grid-stack-item">
        <ExitButton onExit={() => onTimeAttackComplete(null)} />
      </div>
      <div className="flex flex-col items-center gap-2 self-start justify-self-center grid-stack-item">
        <div ref={timerRef} className="font-mono text-lg font-bold">
          0.00
        </div>
        <ProgressRing current={completedItems} total={itemsToComplete} />
        <AnimatePresence mode="popLayout">
          <Challenge challenge={problem} onProblemComplete={onProblemComplete} active />
        </AnimatePresence>
      </div>
    </div>
  );
}

const strokeWidth = 10;
const radius = 50 - strokeWidth / 2;
const circleCoreProps: Partial<React.ComponentProps<typeof motion.circle>> = {
  cx: "50",
  cy: "50",
  pathLength: "1",
  r: radius,
  style: {
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    fill: "none",
  },
};

function ProgressRing({ current, total }: { current: number; total: number }) {
  return (
    <figure className="grid h-[100px] w-[100px]">
      <svg className="col-span-3 row-span-3 h-full w-full text-3xl text-blue-600" viewBox="0 0 100 100">
        <text textAnchor="end" x="50" y="50" dominantBaseline="text-top">
          {current}
        </text>
        <text textAnchor="start" x="50" y="50" dominantBaseline="hanging">
          {total}
        </text>

        <motion.circle {...circleCoreProps} initial={{ pathLength: 1 }} className="text-blue-950" />
        <path d="M70 30 30 70" stroke="currentColor" className="text-blue-950" strokeWidth="4" />
        <motion.circle
          {...circleCoreProps}
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: current / total,
          }}
          transition={{
            duration: 0.1,
          }}
          className="text-blue-500"
        />
        <circle />
      </svg>
    </figure>
  );
}
