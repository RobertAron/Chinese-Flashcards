import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type Ref, useEffect, useState } from "react";
import { Kbd } from "../Kbd";
import { useUserSettings } from "../useUserSettings";

type WordProgressProps = {
  pinyin: string;
  practice?: boolean;
  active?: boolean;
  onComplete?: () => void;
};

type ToneMapConfig = {
  actual: string;
  stripped: string;
  toneKey: string;
  letterKey: string;
};
// prettier-ignore
const toneMap: Record<string, ToneMapConfig | undefined> = {
  ā: { actual: "ā", stripped: "a", toneKey: "1", letterKey: "a" },
  á: { actual: "á", stripped: "a", toneKey: "2", letterKey: "a" },
  ǎ: { actual: "ǎ", stripped: "a", toneKey: "3", letterKey: "a" },
  à: { actual: "à", stripped: "a", toneKey: "4", letterKey: "a" }, // a
  ē: { actual: "ē", stripped: "e", toneKey: "1", letterKey: "e" },
  é: { actual: "é", stripped: "e", toneKey: "2", letterKey: "e" },
  ě: { actual: "ě", stripped: "e", toneKey: "3", letterKey: "e" },
  è: { actual: "è", stripped: "e", toneKey: "4", letterKey: "e" }, // e
  ī: { actual: "ī", stripped: "i", toneKey: "1", letterKey: "i" },
  í: { actual: "í", stripped: "i", toneKey: "2", letterKey: "i" },
  ǐ: { actual: "ǐ", stripped: "i", toneKey: "3", letterKey: "i" },
  ì: { actual: "ì", stripped: "i", toneKey: "4", letterKey: "i" }, // i
  ō: { actual: "ō", stripped: "o", toneKey: "1", letterKey: "o" },
  ó: { actual: "ó", stripped: "o", toneKey: "2", letterKey: "o" },
  ǒ: { actual: "ǒ", stripped: "o", toneKey: "3", letterKey: "o" },
  ò: { actual: "ò", stripped: "o", toneKey: "4", letterKey: "o" }, // o
  ū: { actual: "ū", stripped: "u", toneKey: "1", letterKey: "u" },
  ú: { actual: "ú", stripped: "u", toneKey: "2", letterKey: "u" },
  ǔ: { actual: "ǔ", stripped: "u", toneKey: "3", letterKey: "u" },
  ù: { actual: "ù", stripped: "u", toneKey: "4", letterKey: "u" }, // u
  ǖ: { actual: "ǖ", stripped: "ü", toneKey: "1", letterKey: "u" },
  ǘ: { actual: "ǘ", stripped: "ü", toneKey: "2", letterKey: "u" },
  ǚ: { actual: "ǚ", stripped: "ü", toneKey: "3", letterKey: "u" },
  ǜ: { actual: "ǜ", stripped: "ü", toneKey: "4", letterKey: "u" }, // ü
};
const letterMapping: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

const noTypingRequired = /[ ?’]/;
const punctuation = /[?’]/;
function extractListenChar(char: string | ToneMapConfig | undefined) {
  const isToneCharacter = typeof char === "object";
  return ((isToneCharacter ? char.letterKey : char) ?? "").toLowerCase();
}
export function WordProgress({ pinyin, practice, active, onComplete }: WordProgressProps) {
  const [{ requireToneInput }] = useUserSettings();
  const normalized = pinyin.split("").map((char) => toneMap[char] ?? char);
  const [progress, setProgress] = useState(0);
  const [secondaryProgress, setSecondaryProgress] = useState(0);
  const currentCharacter = normalized[progress];
  const isToneCharacter = typeof currentCharacter === "object";

  useEffect(() => {
    if (!active) return;
    const cb = (e: KeyboardEvent) => {
      const currentCharacter = normalized[progress];
      const isToneCharacter = typeof currentCharacter === "object";
      const rawChar = extractListenChar(currentCharacter);
      const nextRawChar = extractListenChar(normalized[progress + 1]);
      const incrementAmount = noTypingRequired.test(nextRawChar) ? 2 : 1;
      const nextStep = progress + incrementAmount;
      const onLastLetter = progress + incrementAmount === normalized.length;
      const onToneStep = secondaryProgress === 1;
      // characters with tones
      if (isToneCharacter && requireToneInput) {
        if (!onToneStep && e.key.toLocaleLowerCase() === rawChar) setSecondaryProgress(1);
        else if (onToneStep && e.key === currentCharacter.toneKey) {
          setProgress(nextStep);
          setSecondaryProgress(0);
          if (onLastLetter) onComplete?.();
        }
      }
      // characters without tones
      else if (e.key.toLocaleLowerCase() === rawChar) {
        setProgress(nextStep);
        if (onLastLetter) onComplete?.();
      }
    };
    window.addEventListener("keydown", cb);
    return () => window.removeEventListener("keydown", cb);
  }, [active, normalized, progress, secondaryProgress, onComplete, requireToneInput]);
  return (
    <div className="relative flex justify-center gap-[0.05em] text-center font-mono text-2xl tracking-tighter">
      {pinyin
        .split("")
        .slice(0, progress)
        .map((ele, index) => (
          <span
            className={clsx("whitespace-pre text-black", {
              "decoration-black decoration-skip-ink-none": practice,
              underline: !noTypingRequired.test(ele),
            })}
            key={index}
          >
            {ele}
          </span>
        ))}
      {pinyin
        .split("")
        .slice(progress)
        .map((ele, index) => {
          const isNoTypingRequired = noTypingRequired.test(ele);
          const isPunctuation = punctuation.test(ele);
          const showLetter = practice || isPunctuation || isNoTypingRequired;
          return (
            <motion.span
              className={clsx("whitespace-pre text-slate-400", {
                "decoration-black decoration-skip-ink-none": practice,
                underline: !isNoTypingRequired,
                "bg-slate-300/50": index === 0,
              })}
              initial={{ color: "#94a3b800" }}
              animate={active ? "active" : "initial"}
              transition={{
                duration: practice ? 4 : 0,
                delay: practice ? 4 : 0,
              }}
              variants={{
                initial: { color: "#94a3b800" },
                active: { color: "#94a3b8FF" },
              }}
              key={index}
            >
              {showLetter ? ele : " "}
            </motion.span>
          );
        })}
      <AnimatePresence>
        {isToneCharacter && secondaryProgress === 1 && <ToneHints toneMapConfig={currentCharacter} />}
      </AnimatePresence>
    </div>
  );
}

const possibleToneChars = new Set(Object.keys(letterMapping));
function ToneHints({
  toneMapConfig: character,
  ref,
}: {
  toneMapConfig: ToneMapConfig;
  ref?: Ref<HTMLDivElement>;
}) {
  if (!possibleToneChars.has(character.stripped)) return null;
  return (
    <motion.div className="-translate-x-1/2 absolute top-full left-1/2 flex" ref={ref}>
      <motion.div
        className="relative flex gap-2 rounded-md border-2 border-black bg-white p-2"
        initial={{ top: 30, opacity: 0 }}
        animate={{ top: 0, opacity: 1 }}
        exit={{ top: 30, opacity: 0 }}
        transition={{ duration: 0.075 }}
      >
        {letterMapping[character.stripped]?.map((ele, index) => (
          <div className="flex items-center gap-3 rounded-sm border border-slate-700 px-2 py-1" key={index}>
            <Kbd>{index + 1}</Kbd>
            <div className="text-lg">{ele}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

type PinyinChallengeProps = {
  id: string;
  active?: boolean;
  ref?: Ref<HTMLDivElement>;
  children?: React.ReactNode;
};

export function ChallengeWrapper({ id, active, ref, children }: PinyinChallengeProps) {
  return (
    <motion.div
      layout="position"
      layoutId={id}
      className={clsx(
        "flex min-w-80 max-w-sm flex-col items-center gap-4 rounded-md border-2 bg-white px-3 py-4 md:max-w-md lg:max-w-lg",
        {
          "border-black": active,
          "border-slate-300": !active,
        },
      )}
      initial={{ scale: 0, y: -100 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 100 }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
