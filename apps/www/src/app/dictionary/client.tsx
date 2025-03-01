"use client";
import { useMemo, useState } from "react";
import type { Words } from "./page";
import Fuse from "fuse.js";
import { WordOutline } from "@/components/challenges/WordOutline";
import { wordToAudioSource } from "@/utils/idToAudioSource";

export function SearchPage({ words }: { words: Words }) {
  const fuseWords = useMemo(
    () => new Fuse(words, { distance: 0.1, keys: ["characters", "meaning"] }),
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
    <div className="grid grid-flow-row gap-2 py-4">
      <label className="flex flex-col gap-1">
        <span>Search</span>
        <input
          className="rounded-sm border-black p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </label>
      {matchingWords.slice(0, 10).map((word) => {
        return (
          <WordOutline
            word={{
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
