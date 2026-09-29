import { cacheLife } from "next/cache";
import React from "react";
import type { PhraseDefinition, WordDefinition } from "@/components/challenges/challengeServerUtils";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { phraseToAudioSource, phraseToImageSource, wordToAudioSource } from "@/utils/idToAudioSource";
import { punctuation, spacePunctuation } from "@/utils/specialCharacters";
import { deDupe } from "@/utils/structureUtils";
import { hashString } from "./date";

const DAILY_PHRASE_COUNT = 3;
const DAILY_WORD_COUNT = 6;

function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

const canonicalWordSelect = { select: { id: true, characters: true, meaning: true } } as const;

async function getHsk1Phrases() {
  const phrases = await getPrismaClient().phrases.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      meaning: true,
      PhraseWords: {
        orderBy: { order: "asc" },
        select: {
          word: {
            select: {
              id: true,
              characters: true,
              pinyin: true,
              meaning: true,
              hskLevel: true,
              frequencyRank: true,
              emojiChallenge: true,
              buildingBlockOnly: true,
              canonicalWord: canonicalWordSelect,
            },
          },
        },
      },
    },
  });
  return phrases.filter(
    ({ PhraseWords }) =>
      PhraseWords.length > 0 &&
      PhraseWords.every(({ word }) => word.hskLevel === "hsk1" || punctuation.test(word.characters)),
  );
}

export const getDailyChallenge = React.cache(async function getDailyChallenge(dateKey: string) {
  "use cache";
  cacheLife("max");
  const seed = hashString(dateKey);
  const selectedPhrases = seededShuffle(await getHsk1Phrases(), seed).slice(0, DAILY_PHRASE_COUNT);

  const phraseWords = deDupe(
    selectedPhrases
      .flatMap(({ PhraseWords }) => PhraseWords.map(({ word }) => word))
      .filter((word) => !word.buildingBlockOnly && !punctuation.test(word.characters)),
    (word) => word.canonicalWord?.id ?? word.id,
  );
  const leastCommonWordIds = new Set(
    phraseWords
      .toSorted((a, b) => b.frequencyRank - a.frequencyRank)
      .slice(0, DAILY_WORD_COUNT)
      .map((word) => word.id),
  );

  return {
    words: phraseWords
      .filter((word) => leastCommonWordIds.has(word.id))
      .map(
        ({ id, characters, pinyin, meaning, hskLevel, emojiChallenge, canonicalWord }): WordDefinition => ({
          id,
          characters,
          pinyin,
          hskLevel,
          emojiChallenge,
          meaning: canonicalWord?.meaning ?? meaning,
          type: "word",
          audioSrc: wordToAudioSource(id),
          canonicalWord: canonicalWord ?? null,
        }),
      ),
    phrases: selectedPhrases.map(
      ({ PhraseWords, id, meaning }): PhraseDefinition => ({
        id,
        meaning,
        type: "phrase",
        words: PhraseWords.map(({ word }) => ({
          id: word.id,
          characters: word.characters,
          pinyin: word.pinyin,
          hskLevel: word.hskLevel,
          meaning: word.canonicalWord?.meaning ?? word.meaning,
          canonicalWord: word.canonicalWord ?? null,
        })).filter((word) => !punctuation.test(word.characters)),
        characters: PhraseWords.map(({ word }) => word.characters)
          .join(" ")
          .replaceAll(spacePunctuation, "")
          .trim(),
        pinyin: PhraseWords.map(({ word }) => word.pinyin)
          .join(" ")
          .replaceAll(spacePunctuation, "")
          .trim(),
        audioSrc: phraseToAudioSource(id),
        emojiChallenge: null,
        imageSrc: phraseToImageSource(id),
      }),
    ),
  };
});

export type DailyChallenge = Awaited<ReturnType<typeof getDailyChallenge>>;
