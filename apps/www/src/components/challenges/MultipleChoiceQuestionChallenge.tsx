import { useKeyTrigger } from "@/utils/hooks";
import clsx from "clsx";
import * as motion from "motion/react-client";
import { type Ref, useState, useCallback } from "react";
import { buttonBehaviorClasses } from "../coreClasses";
import { Kbd } from "../Kbd";
import { ChallengeAudioPlayer } from "./AudioChallenge";
import type { AllMultipleChoiceChallenges, McqAnswer } from "./ChallengeTypes";
import { ChallengeWrapper } from "./ChallengeWrapper";


const mapping: Record<number, string | undefined> = {
  0: "a",
  1: "b",
  2: "c",
  3: "d",
};

export function MultipleChoiceChallenge({
  thing, onComplete, ref,
}: { thing: AllMultipleChoiceChallenges; onComplete: () => void; ref?: Ref<HTMLDivElement>; }) {
  const [options] = useState(() => thing.getOptions());
  return (
    <motion.div className="flex flex-col gap-4" ref={ref}>
      {thing.type === "multiple-choice-question-character-text" ? (
        <ChallengeWrapper id={thing.id} active>
          <div className="text-xl">{thing.questionText}</div>
        </ChallengeWrapper>
      ) : (
        <ChallengeWrapper id={thing.id} active>
          <ChallengeAudioPlayer slow src={thing.audio} />
        </ChallengeWrapper>
      )}
      <div className="grid grid-cols-2 gap-4">
        {options.map((ele, index) => {
          console.log(ele.id);
          const keyboardShortcut = mapping[index];
          if (keyboardShortcut === undefined) return null;
          return (
            <MultipleChoiceAnswer
              answer={ele}
              letter={keyboardShortcut}
              onComplete={onComplete}
              key={ele.id} />
          );
        })}
      </div>
    </motion.div>
  );
}
function MultipleChoiceAnswer({
  answer, letter, onComplete,
}: { answer: McqAnswer; letter: string; onComplete: () => void; }) {
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
