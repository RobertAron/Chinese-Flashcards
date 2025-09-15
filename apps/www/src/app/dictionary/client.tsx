"use client";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { WordOutline } from "@/components/challenges/WordOutline";
import { wordToAudioSource } from "@/utils/idToAudioSource";
import type { Words } from "./page";

export function SearchPage({ words }: { words: Words }) {
  const fuseWords = useMemo(
    () => new Fuse(words, { distance: 0.1, keys: ["characters", "meaning", "pinyin"] }),
    [words],
  );
  const [input, setInput] = useState("");
  const matchingWords =
    input === ""
      ? words
      : fuseWords
          .search(input)
          .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
          .map((ele) => ele.item);

  return (
    <div className="grid w-full grid-flow-row gap-3 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold underline">Dictionary</h1>
        <label className="flex flex-col gap-1">
          <span className="sr-only">Search</span>
          <input
            className="p-2 border-2 border-black rounded-sm"
            placeholder="Search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
      </div>
      <hr className="my-1 border border-gray-400" />
      {matchingWords.slice(0, 10).map((word) => {
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
