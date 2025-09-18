"use client";
import { ChevronsUpIcon } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useTime } from "motion/react";
import { useRef, useState } from "react";
import { Challenge } from "@/components/challenges/Challenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { timeAttackColors, timeAttackCountToColor } from "@/utils/colorMapping";
import { formatTimeAttackMs, useTimeAttackPB, useWordIncrementor } from "@/utils/playerState";
import { ExitButton } from "../ExitButton";
import { useChallengeStream } from "../useChallengeStream";

export function TimeAttack() {
  const [timeAttackRunning, setTimeAttackRunning] = useState(false);
  const { challengeId } = useDrillContext();
  const [recentFinish, setRecentFinish] = useState<number | null>(null);
  const [previousBest, setNewBest] = useTimeAttackPB(challengeId);
  const currentAward = previousBest === null ? null : timeAttackCountToColor(previousBest);
  const recentAward = previousBest === null ? null : timeAttackCountToColor(previousBest);
  return !timeAttackRunning ? (
    <ChallengeTitle onStart={() => setTimeAttackRunning(true)} improve={previousBest !== null}>
      <div className="flex gap-2">
        <div className="flex flex-col text-3xl font-bold grow basis-0">
          {Object.values(timeAttackColors)
            .map((ele) => (
              <div className="flex items-center gap-1" key={ele.key}>
                <ChevronsUpIcon strokeWidth={3} className={`${ele.font} w-8 h-8`} />
                {formatTimeAttackMs(ele.requiredTime)}
              </div>
            ))
            .toReversed()}
        </div>
        <div className="flex flex-col items-end text-lg grow basis-0">
          <div className="flex truncate gap-1">
            <span>Previous Best:</span>
            <span className="flex items-center gap-1">
              {currentAward && <ChevronsUpIcon strokeWidth={3} className={`${currentAward.font} w-8 h-8`} />}
              {formatTimeAttackMs(previousBest)}
            </span>
          </div>
          {recentFinish !== null && (
            <div className="flex items-end gap-1">
              <div>Recent Finish</div>
              <div className="flex items-end gap-1">
                {recentFinish === previousBest && "🎉"}
                {recentAward && <ChevronsUpIcon strokeWidth={3} className={`${recentAward.font} w-8 h-8`} />}
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
        setNewBest(completedTime);
      }}
    />
  );
}

const itemsToComplete = 40;
function TimeAttackRunning({
  onTimeAttackComplete,
}: {
  onTimeAttackComplete: (completedTime: number | null) => void;
}) {
  const [completedItems, setCompletedItems] = useState(0);
  const { problem, nextProblem, initializing, noProblems } = useChallengeStream();
  const time = useTime();
  const timerRef = useRef<HTMLDivElement>(null!);
  useMotionValueEvent(time, "change", (val) => {
    if (timerRef.current === null) return;
    timerRef.current.textContent = (val / 1000).toFixed(2);
  });
  const wordIncrementor = useWordIncrementor();
  if (initializing) return null;
  if (noProblems) {
    onTimeAttackComplete(null);
    return null;
  }
  const onProblemComplete = () => {
    wordIncrementor(problem.wordIds);
    const points = problem.wordIds.length > 1 ? 3 : 2;
    const nextPoints = completedItems + points;
    if (nextPoints >= itemsToComplete) onTimeAttackComplete(time.get());
    else {
      setCompletedItems(nextPoints);
      nextProblem();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full align-middle gap-2 grow">
      <div className="self-start justify-start">
        <ExitButton onExit={() => onTimeAttackComplete(null)} />
      </div>
      <div className="flex flex-col items-center self-center gap-2 justify-self-center">
        <div ref={timerRef} className="font-mono text-lg font-bold">
          0.00
        </div>
        <ProgressRing current={completedItems} total={itemsToComplete} />
        <AnimatePresence mode="popLayout">
          <Challenge challenge={problem} onComplete={onProblemComplete} active key={problem.id} />
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
    <figure className="grid h-[100px] w-[100px] font-mono">
      <svg
        className="w-full h-full text-3xl text-blue-700 col-span-3 row-span-3"
        viewBox="0 0 100 100"
        role="img"
        aria-label="progress par"
      >
        <text textAnchor="end" x="50" y="50" dominantBaseline="auto">
          {current.toString().padStart(2, "0")}
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
