"use client";
import { useMemo, useState } from "react";
import { WordExperience } from "@/components/challenges/WordPoints";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { TextField } from "@/components/TextField";
import { punctuation } from "@/utils/specialCharacters";
import { useMakeAudio, useMakeImage, useSubmitChallenge } from "./api/[[...route]]/client";
import type { WordsPromise } from "./page.dev";

export function Admin({ words }: { words: WordsPromise }) {
  const wordsLookup = useMemo(() => Object.groupBy(words, (ele) => ele.characters), [words]);
  const [phrase, setPhrase] = useState("我 的 猫 非常 大");
  const [meaning, setMeaning] = useState("My cat is very big.");
  const { data: imageBinary, trigger: makeImage, isMutating: isMakeImageMutating, reset: resetImage } = useMakeImage();
  const { data: dataMakeAudio, trigger: triggerMakeAudio, isMutating: isMakeAudioMutating, reset: resetAudio } = useMakeAudio();
  const audioUrl = useMemo(() => {
    if (dataMakeAudio === undefined) return null;
    const blob = new Blob([dataMakeAudio], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, [dataMakeAudio]);
  const { trigger: submitChallenge } = useSubmitChallenge();

  const phraseWords = phrase
    .split("")
    .filter((ele) => !punctuation.test(ele))
    .join("")
    .split(" ")
    .map((ele) => {
      return wordsLookup[ele]?.[0];
    });

  return (
    <div className="grid grid-cols-2 gap-2">
      <TextField className="col-span-2" label="Phrase" value={phrase} onChange={(e) => setPhrase(e)} />
      <div className="col-span-2 grid grid-cols-6 gap-2">
        {phraseWords.map((word, index) => {
          if (word === undefined) return <div key={`${index}-UNKNOWN`}>UNKNOWN</div>;
          return <WordExperience className="col-span-1" key={`${index}-${word.id}`} {...word} />;
        })}
      </div>
      <TextField className="col-span-2" label="Meaning" value={meaning} onChange={(e) => setMeaning(e)} />
      <div className="col-span-1 flex flex-col gap-2 rounded-md border-2 bg-white p-3">
        <button
          className={buttonBehaviorClasses}
          onClick={() =>
            triggerMakeAudio({ phrase: phraseWords.map((ele) => ele?.characters ?? "").join("") })
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
                words: phraseWords.filter((ele) => ele !== undefined).map((ele) => `${ele.id}`),
              },
            });
            setPhrase("")
            setMeaning("")
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
