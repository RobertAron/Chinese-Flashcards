"use client";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { WordOutline } from "@/components/challenges/WordOutline";
import { TextField } from "@/components/TextField";
import { wordToAudioSource } from "@/utils/idToAudioSource";
import type { Words } from "./page";

const stripPinyinTones = (input: string) =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ü/g, "u")
    .replace(/ǖ|ǘ|ǚ|ǜ/g, "u");

export function SearchPage({ words }: { words: Words }) {
  const fuseWords = useMemo(() => {
    const withToneless = words.map((ele) => ({
      ...ele,
      toneless: stripPinyinTones(ele.pinyin),
    }));
    return new Fuse(withToneless, {
      distance: 0.4,
      threshold: 0.1, // lower = stricter, higher = fuzzier
      minMatchCharLength: 1,
      ignoreLocation: true,
      includeScore: true,
      keys: [
        { name: "characters", weight: 1 },
        { name: "pinyin", weight: 0.9 },
        { name: "toneless", weight: 0.8 },
        { name: "meaning", weight: 0.1 },
      ],
    });
  }, [words]);
  const [input, setInput] = useState("");
  const matchingWords =
    input === ""
      ? words
      : fuseWords
          .search(input)
          .sort((a, b) => {
            const scoreOrder = (a?.score ?? 0) - (b?.score ?? 0);
            if (scoreOrder !== 0) return scoreOrder;
            return a.item.frequencyRank - b.item.frequencyRank;
          })
          .map((ele) => ele.item);
  return (
    <div className="grid w-full grid-flow-row gap-3 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-5xl underline">Dictionary</h1>
        <TextField aria-label="Search" placeholder="Search..." value={input} onChange={(e) => setInput(e)} />
      </div>
      <hr className="my-1 border border-gray-400" />
      {matchingWords.slice(0, 30).map((word) => {
        return (
          <WordOutline
            word={{
              type: "word",
              audioSrc: wordToAudioSource(word.id),
              ...word,
            }}
            key={word.id}
          />
        );
      })}
    </div>
  );
}
