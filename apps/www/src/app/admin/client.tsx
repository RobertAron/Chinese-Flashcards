"use client";
import { useMemo, useState } from "react";
import { WordExperience } from "@/components/challenges/WordPoints";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { TextField } from "@/components/TextField";
import { punctuation } from "@/utils/specialCharacters";
import { useMakeAudio, useMakeImage, useSubmitChallenge } from "./api/[[...route]]/client";
import type { WordsPromise } from "./page";

export function Admin({ words }: { words: WordsPromise }) {
  const wordsLookup = useMemo(() => Object.groupBy(words, (ele) => ele.characters), [words]);
  const [phrase, setPhrase] = useState("我 的 猫 非常 大");
  const [meaning, setMeaning] = useState("");
  const { data: imageBinary, trigger: makeImage, isMutating } = useMakeImage();

  return (
    <div className="flex flex-col gap-2">
      <TextField label="Phrase" value={phrase} onChange={(e) => setPhrase(e)} />
      <div className="grid grid-cols-6 gap-2">
        {phrase
          .split("")
          .filter((ele) => !punctuation.test(ele))
          .join("")
          .split(" ")
          .map((ele, index) => {
            const word = wordsLookup[ele]?.[0];
            if (word === undefined) return <div key={`${index}-UNKNOWN`}>UNKNOWN</div>;
            return <WordExperience className="col-span-1" key={`${index}-${word.id}`} {...word} />;
          })}
      </div>
      <TextField label="Meaning" value={meaning} onChange={(e) => setMeaning(e)} />
      <TTSPlayer />
      <button
        type="button"
        onClick={() => makeImage({ phrase })}
        className={buttonBehaviorClasses}
        disabled={isMutating}
      >
        {isMutating ? "Loading" : "Make Image"}
      </button>
      {imageBinary?.b64 === undefined ? (
        <div>no image</div>
      ) : (
        <img
          width={500}
          height={500}
          src={`data:image/png;base64,${imageBinary.b64}`}
          alt="Generated content"
          className="shadow-md rounded-xl"
        />
      )}
    </div>
  );
}

export default function TTSPlayer() {
  const { data, trigger, isMutating } = useMakeAudio();
  const audioUrl = useMemo(() => {
    if (data === undefined) return null;
    const blob = new Blob([data], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, [data]);
  const { trigger: submitChallenge } = useSubmitChallenge();

  return (
    <div className="p-4">
      <button
        className={buttonBehaviorClasses}
        onClick={() => trigger({ phrase: "Hello world!" })}
        disabled={isMutating}
        type="button"
      >
        {isMutating ? "Generating..." : "Generate Audio"}
      </button>
      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
      <button
        type="button"
        className={buttonBehaviorClasses}
        onClick={() => {
          if (data !== undefined) submitChallenge({ audio: new File([data], "hello.mp3", { type: "mp3" }) });
        }}
      >
        submit audio
      </button>
    </div>
  );
}
