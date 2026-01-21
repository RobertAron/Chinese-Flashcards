"use client";
import { SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { WordExperience } from "@/components/challenges/WordPoints";
import { TextField } from "@/components/TextField";
import { useFullPlayerState } from "@/utils/playerState";
import {
  useMakeAudio,
  useMakeImage,
  useMakePhraseSuggestions,
  useSubmitChallenge,
} from "./api/[[...route]]/client";
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
  const playerState = useFullPlayerState();
  const practiceState = Object.fromEntries(
    words
      .filter((ele) => ele.hskLevel === "hsk1")
      .map(({ id, characters, meaning }) => [
        `${id}`,
        { characters, meaning, practiceCount: playerState.wordPracticeCounts[id] ?? 0 },
      ]),
  );
  const [word, setWord] = useState("");
  const [extraWordInstructions, setExtraWordInstructions] = useState("");
  const [phrase, setPhrase] = useState("我 的 猫 非常 大");
  const [meaning, setMeaning] = useState("My cat is very big.");
  const [extraPictureInstructions, setExtraPictureInstructions] = useState("");
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
  const {
    data: phraseSuggestions = [],
    trigger: triggerMakePhraseSuggestions,
    isMutating: isMakingSuggestions,
  } = useMakePhraseSuggestions();
  const audioUrl = useMemo(() => {
    if (dataMakeAudio === undefined) return null;
    const blob = new Blob([dataMakeAudio], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, [dataMakeAudio]);
  const { trigger: submitChallenge } = useSubmitChallenge();

  const phraseWords = phrase.split(" ").map((ele) => wordsLookup[ele]);
  const chosenWords = phraseWords
    .filter((ele) => ele !== undefined)
    .map((words, wordPosition) => getSelectedWord(wordPosition, variantLookup, words));

  const picture = imageBinary?.b64;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-sm border border-black bg-white p-2 shadow-lg">
        <h2 className="text-3xl">Generate Suggestions</h2>
        <TextField value={word} onChange={(e) => setWord(e)} label="word" />
        <TextField
          value={extraWordInstructions}
          onChange={(e) => setExtraWordInstructions(e)}
          label="phrase suggestions"
        />
        <Button
          className="flex gap-2"
          isDisabled={isMakingSuggestions}
          onClick={async () => {
            triggerMakePhraseSuggestions({
              json: {
                word,
                extraWordInstructions,
                practiceState,
              },
            });
          }}
        >
          <SparklesIcon />
          <span>Generate Phrase Suggestions</span>
        </Button>
        {phraseSuggestions.length > 0 && (
          <>
            <hr />
            <div className="grid grid-cols-4 gap-2">
              {phraseSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  className="text-sm"
                  onClick={() => {
                    setMeaning(suggestion.meaning);
                    setPhrase(suggestion.phrase);
                    setExtraPictureInstructions(suggestion.imageDescription);
                  }}
                >
                  {suggestion.meaning}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-sm border border-black bg-white p-2 shadow-xl">
        <h2 className="text-3xl">Submit Phrase</h2>
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
          <Button
            onClick={() =>
              triggerMakeAudio({ phrase: chosenWords.map((ele) => ele?.characters ?? "").join("") })
            }
            isDisabled={isMakeAudioMutating}
          >
            {isMakeAudioMutating ? "Generating..." : "Generate Audio"}
          </Button>
          {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
        </div>
        <div className="col-span-1 flex flex-col gap-2 rounded-md border-2 bg-white p-3">
          <TextField
            label="Extra instructions"
            value={extraPictureInstructions}
            onChange={(v) => setExtraPictureInstructions(v)}
          />
          <Button
            onClick={() => makeImage({ phrase, extraInstructions: extraPictureInstructions })}
            isDisabled={isMakeImageMutating}
          >
            {isMakeImageMutating ? "Loading" : "Make Image"}
          </Button>
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
        {picture !== undefined && dataMakeAudio !== undefined && (
          <Button
            className="col-span-2"
            onClick={async () => {
              await submitChallenge({
                form: {
                  audio: new File([dataMakeAudio], "audio.mp3", { type: dataMakeAudio.type }),
                  picture,
                  meaning,
                  words: chosenWords.filter((ele) => ele !== null).map((ele) => `${ele.id}`),
                },
              });
              setPhrase("");
              setMeaning("");
              setExtraPictureInstructions("");
              resetImage();
              resetAudio();
            }}
          >
            Upload
          </Button>
        )}
      </div>
    </div>
  );
}
