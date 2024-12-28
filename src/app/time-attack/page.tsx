"use client";
import { AppPage } from "@/components/AppPage";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { useChallenge } from "@/utils/useChallenge";
import { useChallengeStream } from "@/utils/useChallengeStream";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AnimatePresence, useMotionValueEvent, useTime } from "motion/react";
import { useRef, useState } from "react";

export default AppPage(() => {
  const [timeAttackRunning, setTimeAttackRunning] = useState(false);
  const challenge = useChallenge();
  if (challenge === null) throw new Error("Not found challenge");
  const [previousBest, setNewBest] = useLocalStorage<number | null>(
    `${challenge.challengeId}-best-time-attack-time`,
    null,
  );
  return timeAttackRunning ? (
    <TimeAttackRunning
      onTimeAttackComplete={(completedTime) => {
        setTimeAttackRunning(false);
        if (previousBest === null || completedTime < previousBest)
          setNewBest(completedTime);
      }}
    />
  ) : (
    <div>
      {previousBest === null ? (
        <div>Not attempted yet</div>
      ) : (
        <div>Previous best {(previousBest / 1000).toFixed(2)}</div>
      )}
      <button onClick={() => setTimeAttackRunning(true)}>start</button>
    </div>
  );
});

function TimeAttackRunning({
  onTimeAttackComplete,
}: {
  onTimeAttackComplete: (completedTime: number) => void;
}) {
  const challenge = useChallenge();
  const [remainingItems, setRemainingItems] = useState(20);
  if (challenge === null) throw new Error("Not found challenge");
  const { problem, nextProblem } = useChallengeStream(challenge.content);
  const time = useTime();
  const timerRef = useRef<HTMLDivElement>(null!);
  useMotionValueEvent(time, "change", (val) => {
    timerRef.current.textContent = (val / 1000).toFixed(2);
  });

  return (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div ref={timerRef} className="font-mono">
        0.00
      </div>
      <div>{remainingItems}</div>
      <AnimatePresence mode="popLayout">
        <PinyinChallenge
          {...problem}
          onComplete={() => {
            if (remainingItems === 1) onTimeAttackComplete(time.get());
            else {
              setRemainingItems(remainingItems - 1);
              nextProblem();
            }
          }}
          key={problem.id}
          id={`${problem.id}`}
          active
        />
      </AnimatePresence>
    </div>
  );
}
