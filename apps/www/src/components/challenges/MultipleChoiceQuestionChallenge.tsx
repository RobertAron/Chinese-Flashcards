import { useKeyTrigger } from "@/utils/hooks";
import clsx from "clsx";
import { type Ref, useState, useCallback, useEffect } from "react";
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
  problem,
  onComplete,
  ref,
}: { problem: AllMultipleChoiceChallenges; onComplete: () => void; ref?: Ref<HTMLDivElement> }) {
  const [options, setOptions] = useState(() => problem.getOptions());
  useEffect(() => {
    setOptions(problem.getOptions());
  }, [problem]);
  return (
    <ChallengeWrapper id={problem.id} active className="self-stretch" ref={ref}>
      {problem.type === "multiple-choice-question-character-text" ? (
        <div className="text-xl">{problem.questionText}</div>
      ) : (
        <ChallengeAudioPlayer slow src={problem.audio} />
      )}
      <div className="grid grid-cols-2 grid-rows-2 gap-1">
        {options.map((ele, index) => {
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
    </ChallengeWrapper>
  );
}
function MultipleChoiceAnswer({
  answer,
  letter,
  onComplete,
}: { answer: McqAnswer; letter: string; onComplete: () => void }) {
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
      className={clsx(buttonBehaviorClasses, "flex items-start gap-2 p-2 text-start", {
        "bg-red-400": selected && !answer.correct,
        "bg-green-400": selected && answer.correct,
      })}
    >
      <Kbd>{letter.toUpperCase()}</Kbd>
      <span>{answer.text}</span>
    </button>
  );
}
