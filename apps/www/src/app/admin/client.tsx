"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { WordExperience } from "@/components/challenges/WordPoints";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { TextField } from "@/components/TextField";
import { useMakeAudio, useMakeImage, useSubmitChallenge } from "./api/[[...route]]/client";
import type { WordsPromise } from "./page.dev";

function getSelectedWord<T>(wordPosition: number, wordSelections: number[], possibleWords: T[]) {
  const [firstWord] = possibleWords;
  const selectedIndex = wordSelections[wordPosition] ?? 0;
  const rawWord = possibleWords[selectedIndex];
  if (rawWord === undefined) return firstWord ?? null;
  return rawWord;
}

export function Admin({ words }: { words: WordsPromise }) {
  const wordsLookup = useMemo(() => Object.groupBy(words, (ele) => ele.characters), [words]);
  const [phrase, setPhrase] = useState("我 的 猫 非常 大");
  const [meaning, setMeaning] = useState("My cat is very big.");
  const [variantLookup, setVariantLookup] = useState<number[]>([]);
  const {
    data: imageBinary,
    trigger: makeImage,
    isMutating: isMakeImageMutating,
    reset: resetImage,
  } = useMakeImage();
  const {
    data: dataMakeAudio,
    trigger: triggerMakeAudio,
    isMutating: isMakeAudioMutating,
    reset: resetAudio,
  } = useMakeAudio();
  const audioUrl = useMemo(() => {
    if (dataMakeAudio === undefined) return null;
    const blob = new Blob([dataMakeAudio], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, [dataMakeAudio]);
  const { trigger: submitChallenge } = useSubmitChallenge();

  const phraseWords = phrase.split(" ").map((ele) => wordsLookup[ele]);
  const chosenWords = phraseWords.filter(ele=>ele!==undefined).map((words, wordPosition) =>
    getSelectedWord(wordPosition, variantLookup, words),
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      <TextField className="col-span-2" label="Phrase" value={phrase} onChange={(e) => setPhrase(e)} />
      <div className="col-span-2 grid grid-cols-6 gap-2">
        {phraseWords.map((words, wordPosition) => {
          if (words === undefined) return <div key={`${wordPosition}-UNKNOWN`}>UNKNOWN</div>;
          const word = getSelectedWord(wordPosition, variantLookup, words);
          if (word === null) return <div key={`${wordPosition}-UNKNOWN`}>UNKNOWN</div>;
          return (
            <div className="flex flex-col gap-1" key={`${wordPosition}-${word.id}`}>
              {words?.length > 1 && (
                <div className="flex gap-1 *:grow">
                  {new Array(words?.length).fill(null).map((_, index) => {
                    return (
                      <Button
                        key={index}
                        onClick={() => {
                          setVariantLookup((curr) => {
                            const copy = curr.slice();
                            copy[wordPosition] = index;
                            return copy;
                          });
                        }}
                      >{`${index}`}</Button>
                    );
                  })}
                </div>
              )}
              <WordExperience className="col-span-1" {...word} />
            </div>
          );
        })}
      </div>
      <TextField className="col-span-2" label="Meaning" value={meaning} onChange={(e) => setMeaning(e)} />
      <div className="col-span-1 flex flex-col gap-2 rounded-md border-2 bg-white p-3">
        <button
          className={buttonBehaviorClasses}
          onClick={() =>
            triggerMakeAudio({ phrase: chosenWords.map((ele) => ele?.characters ?? "").join("") })
          }
          disabled={isMakeAudioMutating}
          type="button"
        >
          {isMakeAudioMutating ? "Generating..." : "Generate Audio"}
        </button>
        {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
      </div>
      <div className="col-span-1 flex flex-col gap-2 rounded-md border-2 bg-white p-3">
        <button
          type="button"
          onClick={() => makeImage({ phrase })}
          className={buttonBehaviorClasses}
          disabled={isMakeImageMutating}
        >
          {isMakeImageMutating ? "Loading" : "Make Image"}
        </button>
        {imageBinary?.b64 === undefined ? (
          <div>no image</div>
        ) : (
          <img
            width={500}
            height={500}
            src={`data:image/png;base64,${imageBinary.b64}`}
            alt="Generated content"
            className="rounded-xl shadow-md"
          />
        )}
      </div>
      {imageBinary?.b64 !== undefined && dataMakeAudio !== undefined && (
        <button
          type="button"
          className={`${buttonBehaviorClasses} col-span-2`}
          onClick={async () => {
            await submitChallenge({
              form: {
                audio: new File([dataMakeAudio], "audio.mp3", { type: dataMakeAudio.type }),
                picture: imageBinary.b64,
                meaning,
                words: chosenWords.filter((ele) => ele !== null).map((ele) => `${ele.id}`),
              },
            });
            setPhrase("");
            setMeaning("");
            resetImage();
            resetAudio();
          }}
        >
          Upload
        </button>
      )}
    </div>
  );
}
