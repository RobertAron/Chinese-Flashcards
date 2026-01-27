"use client";
import { type Ref, useEffect, useEffectEvent, useState } from "react";
import { shuffle } from "@/utils/structureUtils";
import { twCn } from "@/utils/styleResolvers";
import { Button } from "../Button";
import { buttonBehaviorClasses } from "../coreClasses";
import { Kbd } from "../Kbd";
import type { SentenceWord } from "./ChallengeTypes";
import { ChallengeWrapper } from "./ChallengeWrapper";

type SentenceBuildingChallengeProps = {
  englishTranslation: string;
  words: SentenceWord[];
  correctOrder: string[];
  onComplete?: () => void;
  ref?: Ref<HTMLDivElement>;
};

export function SentenceBuildingChallenge({
  englishTranslation,
  words,
  correctOrder,
  onComplete,
  ref,
}: SentenceBuildingChallengeProps) {
  const [prevWords, setPrevWords] = useState(words);
  const [shuffledWords, setShuffledWords] = useState(() => shuffle([...words]));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  if (prevWords !== words) {
    setPrevWords(words);
    setShuffledWords(shuffle([...words]));
    setSelectedIds([]);
  }

  // Derive isCorrect from selectedIds
  const isCorrect =
    selectedIds.length === words.length && selectedIds.length > 0
      ? selectedIds.every((id, index) => id === correctOrder[index])
      : null;

  const addWord = (wordId: string) => {
    if (isCorrect !== null) return;
    setSelectedIds((prev) => [...prev, wordId]);
  };

  const removeWord = (wordId: string) => {
    if (isCorrect === true) return;
    setSelectedIds((prev) => prev.filter((id) => id !== wordId));
  };

  // Call onComplete when correct
  useEffect(() => {
    if (isCorrect) onComplete?.();
  }, [isCorrect, onComplete]);

  // Keyboard handler for number keys
  const handleKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (isCorrect === true) return;

    const keyNum = Number.parseInt(e.key, 10);
    if (Number.isNaN(keyNum) || keyNum < 1 || keyNum > 9) return;

    const targetWord = shuffledWords[keyNum - 1];
    if (!targetWord) return;

    if (selectedIds.includes(targetWord.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== targetWord.id));
    } else {
      setSelectedIds((prev) => [...prev, targetWord.id]);
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <ChallengeWrapper className="self-stretch" ref={ref}>
      <div className="flex min-h-24 items-center justify-center text-center">
        <div className="text-2xl text-slate-700">{englishTranslation}</div>
      </div>

      <div className="flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-md border-2 border-slate-300 bg-slate-50 p-3">
        {selectedIds.length === 0 ? (
          <span className="text-slate-400">Click words below to build the sentence</span>
        ) : (
          selectedIds.map((id) => {
            const word = words.find((w) => w.id === id);
            if (!word) return null;
            return (
              <Button
                key={id}
                onPress={() => removeWord(id)}
                isDisabled={isCorrect === true}
                className={twCn(buttonBehaviorClasses, "px-4 py-2 text-2xl", {
                  "bg-green-200! hocus:bg-green-300!": isCorrect === true,
                  "bg-red-200! hocus:bg-red-300!": isCorrect === false,
                })}
              >
                {word.character}
              </Button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {shuffledWords.map((word, index) => {
          const isSelected = selectedIds.includes(word.id);
          const hasKeyboardShortcut = index < 9;
          const keyboardShortcut = hasKeyboardShortcut ? (index + 1).toString() : undefined;

          return (
            <Button
              key={word.id}
              onPress={() => addWord(word.id)}
              isDisabled={isSelected || isCorrect !== null}
              className={twCn(buttonBehaviorClasses, "flex items-center gap-2 px-4 py-2 text-2xl", {
                "opacity-50": isSelected || isCorrect !== null,
              })}
            >
              {keyboardShortcut && <Kbd>{keyboardShortcut}</Kbd>}
              <span>{word.character}</span>
            </Button>
          );
        })}
      </div>

      {isCorrect === false && (
        <div className="text-center text-red-600 text-sm">
          Incorrect order. Click words to remove and try again.
        </div>
      )}
    </ChallengeWrapper>
  );
}
