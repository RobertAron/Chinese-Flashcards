"use client";
import Fuse from "fuse.js";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import { WordOutline } from "@/components/challenges/WordOutline";
import { Skeleton } from "@/components/Skeleton";
import { TextField } from "@/components/TextField";
import { wordToAudioSource } from "@/utils/idToAudioSource";
import type { Words } from "./page";

const stripPinyinTones = (input: string) =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ü/g, "u")
    .replace(/ǖ|ǘ|ǚ|ǜ/g, "u");

const hskRank = (hskLevel: string | null) => (hskLevel === null ? 8 : Number(hskLevel.slice(3)) || 8);

/** 0 = the query is exactly this word, 1 = the word starts with the query, 2 = fuzzy match. */
function matchTier(
  word: { characters: string; pinyin: string; toneless: string; meaning: string },
  q: string,
  qToneless: string,
) {
  const pinyin = word.pinyin.toLowerCase();
  const toneless = word.toneless.toLowerCase();
  if (word.characters === q || pinyin === q || toneless === qToneless) return 0;
  if (
    word.characters.startsWith(q) ||
    pinyin.startsWith(q) ||
    toneless.startsWith(qToneless) ||
    word.meaning.toLowerCase() === q
  )
    return 1;
  return 2;
}

export function SearchPage({ words }: { words: Promise<Words> }) {
  const [input, setInput] = useState("");
  return (
    <div className="flex w-full flex-col gap-3 py-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-5xl underline">Dictionary</h1>
        <TextField aria-label="Search" placeholder="Search..." value={input} onChange={(e) => setInput(e)} />
      </div>
      <hr className="my-1 border border-gray-400" />
      <Suspense fallback={<ResultsSkeleton />}>
        <SyncSearchFromUrl setInput={setInput} />
        <SearchResults words={words} input={input} />
      </Suspense>
    </div>
  );
}

/**
 * useSearchParams() blocks prerendering, so it lives inside the results
 * Suspense boundary to keep the heading and search box in the instant shell.
 */
function SyncSearchFromUrl({ setInput }: { setInput: (value: string) => void }) {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("search") ?? "";
  useEffect(() => {
    if (searchFromUrl) setInput(searchFromUrl);
  }, [searchFromUrl, setInput]);
  return null;
}

function ResultsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <Skeleton className="h-20 w-full" key={row} />
      ))}
    </>
  );
}

function SearchResults({ words: wordsPromise, input }: { words: Promise<Words>; input: string }) {
  const words = use(wordsPromise);
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
  const q = input.trim().toLowerCase();
  const qToneless = stripPinyinTones(q);
  const matchingWords =
    input === ""
      ? words
      : fuseWords
          .search(input)
          .map((result) => ({
            item: result.item,
            tier: matchTier(result.item, q, qToneless),
            // The 0.1 threshold means every result already matched well, so raw scores only
            // differ by noise. Quantize into coarse bands so HSK level and frequency decide
            // the order between near-equal matches instead of the score's least significant digits.
            scoreBand: Math.round((result.score ?? 0) * 25),
            hsk: hskRank(result.item.hskLevel),
          }))
          .sort(
            (a, b) =>
              a.tier - b.tier ||
              a.scoreBand - b.scoreBand ||
              a.hsk - b.hsk ||
              a.item.frequencyRank - b.item.frequencyRank,
          )
          .map((ele) => ele.item);
  return (
    <>
      {matchingWords.slice(0, 30).map((word) => {
        return (
          <WordOutline
            className="grow-0"
            word={{
              type: "word",
              audioSrc: wordToAudioSource(word.id),
              ...word,
              meaning: word.canonicalWord?.meaning ?? word.meaning,
              canonicalWord: word.canonicalWord ?? null,
            }}
            key={word.id}
          />
        );
      })}
    </>
  );
}
