"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/ChallengeContext";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useTime,
} from "motion/react";
import { useRef, useState } from "react";
import { useChallengeStream } from "../useChallengeStream";
import { useTimeAttackPB } from "../../playerStats";
import { match } from "ts-pattern";
import { AudioChallenge } from "@/components/challenges/AudioChallenge";

export default AppPage(() => {
  const [timeAttackRunning, setTimeAttackRunning] = useState(false);
  const { challengeId } = useChallengeContext();
  const [recentFinish, setRecentFinish] = useState<number | null>(null);
  const [previousBest, setNewBest] = useTimeAttackPB(challengeId);
  return timeAttackRunning ? (
    <TimeAttackRunning
      onTimeAttackComplete={(completedTime) => {
        setTimeAttackRunning(false);
        setRecentFinish(completedTime);
        if (previousBest === null || completedTime < previousBest)
          setNewBest(completedTime);
      }}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="grid grid-cols-2 rounded-sm border-2 border-black bg-white p-2 text-lg">
        <div>Previous Best</div>
        <div className="text-end">
          {previousBest === null ? "N/A" : (previousBest / 1000).toFixed(2)}
        </div>
        {recentFinish !== null && (
          <>
            <div>Recent Finish</div>
            <div className="text-end">
              {recentFinish === previousBest && "🎉"}
              {(recentFinish / 1000).toFixed(2)}
            </div>
          </>
        )}
      </div>
      <button
        className="rounded-lg border-2 border-black bg-white p-2 text-xl hocus:border-slate-300 hocus:bg-black hocus:text-white"
        onClick={() => setTimeAttackRunning(true)}
        autoFocus
      >
        START
      </button>
    </div>
  );
});

const itemsToComplete = 20;
function TimeAttackRunning({
  onTimeAttackComplete,
}: {
  onTimeAttackComplete: (completedTime: number) => void;
}) {
  const [completedItems, setCompletedItems] = useState(0);
  const { problem, nextProblem, init } = useChallengeStream();
  const time = useTime();
  const timerRef = useRef<HTMLDivElement>(null!);
  useMotionValueEvent(time, "change", (val) => {
    timerRef.current.textContent = (val / 1000).toFixed(2);
  });
  if (problem === undefined) {
    init();
    return null;
  }

  const onProblemComplete = () => {
    if (completedItems === itemsToComplete - 1)
      onTimeAttackComplete(time.get());
    else {
      setCompletedItems(completedItems + 1);
      nextProblem();
    }
  };

  return (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div ref={timerRef} className="font-mono">
        0.00
      </div>
      <div className="grid grid-cols-5 gap-1">
        {new Array(20).fill(null).map((_, index) => (
          <ProgressItem complete={index < completedItems} key={index} />
        ))}
      </div>
      <div>{completedItems}</div>
      <AnimatePresence mode="popLayout">
        {match(problem)
          .with({ type: "pinyin-challenge" }, (problem) => (
            <PinyinChallenge
              {...problem}
              onComplete={onProblemComplete}
              key={problem.id}
              id={problem.id}
              active
            />
          ))
          .with({ type: "audio-challenge" }, (problem) => (
            <AudioChallenge
              {...problem}
              onComplete={onProblemComplete}
              key={problem.id}
              id={problem.id}
              active
            />
          ))
          .exhaustive()}
      </AnimatePresence>
    </div>
  );
}

function ProgressItem({ complete }: { complete?: boolean }) {
  return (
    <motion.div className="h-6 w-6 content-center items-center justify-center justify-items-center grid-stack">
      <motion.div className="h-full w-full rounded-full border-2 border-black bg-slate-300 grid-stack-item" />
      <motion.div
        className="rounded-full border-solid border-black bg-green-600 grid-stack-item"
        initial={{
          width: "0%",
          height: "0%",
          borderWidth: "0px",
        }}
        transition={{
          duration: 0.1,
        }}
        animate={complete ? "complete" : "initial"}
        variants={{
          complete: { width: "100%", height: "100%", borderWidth: "2px" },
        }}
      />
    </motion.div>
  );
}
