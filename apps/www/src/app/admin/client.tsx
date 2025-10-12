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
  const { data: imageBinary, trigger: makeImage, isMutating: isMakeImageMutating } = useMakeImage();
  const { data: dataMakeAudio, trigger: triggerMakeAudio, isMutating: isMakeAudioMutating } = useMakeAudio();
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
    <div className="flex flex-col gap-2">
      <TextField label="Phrase" value={phrase} onChange={(e) => setPhrase(e)} />
      <div className="grid grid-cols-6 gap-2">
        {phraseWords.map((word, index) => {
          if (word === undefined) return <div key={`${index}-UNKNOWN`}>UNKNOWN</div>;
          return <WordExperience className="col-span-1" key={`${index}-${word.id}`} {...word} />;
        })}
      </div>
      <TextField label="Meaning" value={meaning} onChange={(e) => setMeaning(e)} />
      <button
        className={buttonBehaviorClasses}
        onClick={() => triggerMakeAudio({ phrase: "Hello world!" })}
        disabled={isMakeAudioMutating}
        type="button"
      >
        {isMakeAudioMutating ? "Generating..." : "Generate Audio"}
      </button>
      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
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
          className="shadow-md rounded-xl"
        />
      )}
      {imageBinary?.b64 !== undefined && dataMakeAudio !== undefined && (
        <button
          type="button"
          onClick={() => {
            submitChallenge({
              form: {
                audio: new File([dataMakeAudio], "audio.mp3", { type: dataMakeAudio.type }),
                picture: imageBinary.b64,
                meaning,
                words: phraseWords.filter((ele) => ele !== undefined).map((ele) => `${ele.id}`),
              },
            });
          }}
        >
          Upload
        </button>
      )}
    </div>
  );
}
