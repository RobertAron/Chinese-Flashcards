"use client";
import { useMemo, useState } from "react";
import { WordExperience } from "@/components/challenges/WordPoints";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { TextField } from "@/components/TextField";
import { punctuation } from "@/utils/specialCharacters";
import type { CreateImageAction, WordsPromise } from "./dev.page";

export function Admin({
  words,
  createImageAction,
}: {
  words: WordsPromise;
  createImageAction: CreateImageAction;
}) {
  const wordsLookup = useMemo(() => Object.groupBy(words, (ele) => ele.characters), [words]);
  const [phrase, setPhrase] = useState("我 的 猫 非常 大");
  const [meaning, setMeaning] = useState("");
  const [imageBinary, setImageBinary] = useState<undefined | string>(undefined);

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
      <button
        type="button"
        onClick={async () => {
          const res = await createImageAction?.(phrase);
          setImageBinary(res);
        }}
        className={buttonBehaviorClasses}
      >
        Make Image
      </button>
      {imageBinary === undefined ? (
        <div>no image</div>
      ) : (
        <img
          width={500}
          height={500}
          src={`data:image/png;base64,${imageBinary}`}
          alt="Generated content"
          className="rounded-xl shadow-md"
        />
      )}
    </div>
  );
}
