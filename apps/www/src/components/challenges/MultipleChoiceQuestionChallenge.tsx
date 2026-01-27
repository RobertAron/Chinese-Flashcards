import { type Ref, useCallback, useState } from "react";
import { useKeyTrigger } from "@/utils/hooks";
import { twCn } from "@/utils/styleResolvers";
import { Button } from "../Button";
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
  challenge,
  onComplete,
  ref,
}: {
  challenge: AllMultipleChoiceChallenges;
  onComplete: () => void;
  ref?: Ref<HTMLDivElement>;
}) {
  const [prevChallenge, setPrevChallenge] = useState(challenge);
  const [options, setOptions] = useState(() => challenge.getOptions());
  if (prevChallenge !== challenge) {
    setPrevChallenge(challenge);
    setOptions(challenge.getOptions());
  }
  return (
    <ChallengeWrapper className="self-stretch" ref={ref}>
      {challenge.type === "multiple-choice-question-character-text" ? (
        <div className="grow text-3xl">{challenge.questionText}</div>
      ) : (
        <ChallengeAudioPlayer slow src={challenge.audio} />
      )}
      <div className="grid grid-cols-2 grid-rows-2 gap-1">
        {options.map((ele, index) => {
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
}: {
  answer: McqAnswer;
  letter: string;
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState(false);
  const onSelected = useCallback(() => {
    setSelected(true);
    if (answer.correct) onComplete();
  }, [answer.correct, onComplete]);
  useKeyTrigger(letter, () => {
    onSelected();
  });
  const buttonClasses = twCn(buttonBehaviorClasses, "flex items-start gap-2 p-2 text-start text-xl", {
    "bg-red-200 hocus:bg-red-900": selected && !answer.correct,
    "bg-green-200 hocus:bg-green-900": selected && answer.correct,
  });
  return (
    <Button onClick={onSelected} type="button" className={buttonClasses}>
      <Kbd>{letter.toUpperCase()}</Kbd>
      <span>{answer.text}</span>
    </Button>
  );
}
