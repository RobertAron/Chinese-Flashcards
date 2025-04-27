"use client";
import { Kbd } from "@/components/Kbd";
import { ChallengeAudioPlayer } from "@/components/challenges/AudioChallenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { ChallengeWrapper } from "@/components/challenges/ChallengeWrapper";
import {
  type AllMultipleChoiceChallenges,
  type Answer,
  useMultipleChoiceChallengeProvider,
} from "@/components/challenges/MultipleChoiceChallengeProvider";
import { useKeyTrigger } from "@/utils/hooks";
import { semiShuffle, shuffle } from "@/utils/structureUtils";
import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type Ref, useCallback, useEffect, useState } from "react";
import { ExitButton } from "../ExitButton";
import { buttonBehaviorClasses } from "@/components/coreClasses";

export function useChallengeStream() {
  const data = useMultipleChoiceChallengeProvider();
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblems] = useState<AllMultipleChoiceChallenges[] | null>(null);
  useEffect(() => {
    setProblems(shuffle(data.challenges.map((ele) => ele())));
  }, [data]);
  const problem = problems?.[problemIndex];
  if (problem === undefined) {
    return { initializing: true } as const;
  }
  function nextProblem() {
    const onLastItem = problemIndex === problems!.length - 1;
    if (onLastItem) {
      setProblems(semiShuffle(data.challenges.map((ele) => ele())));
      setProblemIndex(0);
    } else setProblemIndex(problemIndex + 1);
  }
  return { problem, nextProblem, initializing: false } as const;
}

export function Test() {
  const stream = useChallengeStream();
  const [started, setStarted] = useState(false);
  if (stream.initializing) return null;

  return !started ? (
    <ChallengeTitle onStart={() => setStarted(true)} />
  ) : (
    <div className="relative flex h-full grow flex-col items-center justify-center gap-2 align-middle">
      <div className="justify-start self-start">
        <ExitButton onExit={() => setStarted(false)} />
      </div>
      <div className="flex flex-col items-center self-center justify-self-center">
        <AnimatePresence mode="popLayout">
          <Challenge thing={stream.problem} onComplete={stream.nextProblem} key={stream.problem.id} />
        </AnimatePresence>
      </div>
    </div>
  );
}

const mapping: Record<number, string | undefined> = {
  0: "a",
  1: "b",
  2: "c",
  3: "d",
};

function Challenge({
  thing,
  onComplete,
  ref,
}: { thing: AllMultipleChoiceChallenges; onComplete: () => void; ref?: Ref<HTMLDivElement> }) {
  console.log("Challenge Render");
  return (
    <motion.div className="flex flex-col gap-4" ref={ref}>
      {thing.type === "typing-character-text" ? (
        <ChallengeWrapper id={thing.id} active>
          <div className="text-xl">{thing.questionText}</div>
        </ChallengeWrapper>
      ) : (
        <ChallengeWrapper id={thing.id} active>
          <ChallengeAudioPlayer slow src={thing.audio} />
        </ChallengeWrapper>
      )}
      <div className="grid grid-cols-2 gap-4">
        {thing.options.map((ele, index) => {
          console.log(ele.id);
          const keyboardShortcut = mapping[index];
          if (keyboardShortcut === undefined) return null;
          return (
            <MultipleChoiceAnswer
              answer={ele}
              letter={keyboardShortcut}
              onComplete={onComplete}
              key={ele.id}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function MultipleChoiceAnswer({
  answer,
  letter,
  onComplete,
}: { answer: Answer; letter: string; onComplete: () => void }) {
  const [selected, setSelected] = useState(false);
  const onSelected = useCallback(() => {
    setSelected(true);
    if (answer.correct) onComplete();
  }, [answer.correct, onComplete]);
  useKeyTrigger(letter, () => {
    onSelected();
  });
  return (
    <button
      onClick={onSelected}
      type="button"
      className={clsx(buttonBehaviorClasses, "flex gap-2 p-6", {
        "bg-red-400": selected && !answer.correct,
        "bg-green-400": selected && answer.correct,
      })}
    >
      <Kbd>{letter}</Kbd>
      <span>{answer.text}</span>
    </button>
  );
}
