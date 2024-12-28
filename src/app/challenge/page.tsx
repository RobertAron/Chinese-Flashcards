"use client";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { data } from "@/data/top100";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

const words = data.slice(0, 10).map((ele, index) => ({
  ...ele,
  key: index,
}));

export default function Challenge() {
  const [index, setMyIndex] = useState(0);
  const word = words[index];
  if (word === undefined) throw new Error("Error Finding Word");
  return (
    <div className="relative flex h-full grow flex-col-reverse items-center justify-center gap-2 align-middle">
      <AnimatePresence mode="popLayout">
        <PinyinChallenge
          {...word}
          onComplete={() => setMyIndex(index + 1)}
          id={`${word.key}`}
          active
          practice
        />
      </AnimatePresence>
    </div>
  );
}
