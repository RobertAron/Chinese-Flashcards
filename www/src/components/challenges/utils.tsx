import clsx from "clsx";
import { Ref, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Kbd } from "../Kbd";

type WordProgressProps = {
  pinyin: string;
  practice?: boolean;
  display?: boolean;
  active?: boolean;
  onComplete?: () => void;
};

// prettier-ignore
const toneMap : Record<string, [string,string,string] | undefined> = {
  'ā': ['ā',"a","1"], 'á': ['á',"a","2"], 'ǎ': ['ǎ',"a","3"], 'à': ['à',"a","4"], // a
  'ē': ['ē',"e","1"], 'é': ['é',"e","2"], 'ě': ['ě',"e","3"], 'è': ['è',"e","4"], // e
  'ī': ['ī',"i","1"], 'í': ['í',"i","2"], 'ǐ': ['ǐ',"i","3"], 'ì': ['ì',"i","4"], // i
  'ō': ['ō',"o","1"], 'ó': ['ó',"o","2"], 'ǒ': ['ǒ',"o","3"], 'ò': ['ò',"o","4"], // o
  'ū': ['ū',"u","1"], 'ú': ['ú',"u","2"], 'ǔ': ['ǔ',"u","3"], 'ù': ['ù',"u","4"], // u
  'ǖ': ['ǖ',"u","1"], 'ǘ': ['ǘ',"u","2"], 'ǚ': ['ǚ',"u","3"], 'ǜ': ['ǜ',"u","4"], // ü
};
const letterMapping: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

const noTypingRequired = /[ ?]/;
const punctuation = /[?]/;
function extractChar(char: string | [string, string, string] | undefined) {
  const isToneCharacter = Array.isArray(char);
  return ((isToneCharacter ? char[1] : char) ?? "").toLowerCase();
}
export function WordProgress({
  pinyin,
  practice,
  active,
  onComplete,
}: WordProgressProps) {
  const normalized = pinyin.split("").map((char) => toneMap[char] ?? char);
  const [progress, setProgress] = useState(0);
  const [secondaryProgress, setSecondaryProgress] = useState(0);
  const currentCharacter = normalized[progress];
  const isToneCharacter = Array.isArray(currentCharacter);

  useEffect(() => {
    if (!active) return;
    const cb = (e: KeyboardEvent) => {
      const currentCharacter = normalized[progress];
      const isToneCharacter = Array.isArray(currentCharacter);
      const rawChar = extractChar(currentCharacter);
      const nextRawChar = extractChar(normalized[progress + 1]);
      const incrementAmount = noTypingRequired.test(nextRawChar) ? 2 : 1;
      const nextStep = progress + incrementAmount;
      const onLastLetter = progress + incrementAmount === normalized.length;
      // characters with tones
      if (isToneCharacter) {
        if (secondaryProgress === 0 && e.key.toLocaleLowerCase() === rawChar)
          setSecondaryProgress(1);
        else if (secondaryProgress === 1 && e.key === currentCharacter[2]) {
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
  }, [active, normalized, progress, secondaryProgress, onComplete]);
  return (
    <div className="relative flex justify-center gap-[0.05em] text-center font-mono text-xl tracking-tighter">
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
                display: { color: "#000" },
              }}
              key={index}
            >
              {showLetter ? ele : "·"}
            </motion.span>
          );
        })}
      <AnimatePresence>
        {isToneCharacter && secondaryProgress === 1 && (
          <ToneHints character={currentCharacter[1]} />
        )}
      </AnimatePresence>
    </div>
  );
}

const possibleToneChars = new Set(Object.keys(letterMapping));
function ToneHints({
  character,
  ref,
}: {
  character: string;
  ref?: Ref<HTMLDivElement>;
}) {
  if (!possibleToneChars.has(character)) return null;
  return (
    <motion.div
      className="absolute left-1/2 top-full flex -translate-x-1/2"
      ref={ref}
    >
      <motion.div
        className="relative flex gap-2 rounded-md border-2 border-black bg-white p-2"
        initial={{ top: 30, opacity: 0 }}
        animate={{ top: 0, opacity: 1 }}
        exit={{ top: 30, opacity: 0 }}
        transition={{ duration: 0.075 }}
      >
        {letterMapping[character]?.map((ele, index) => (
          <div
            className="flex items-center gap-3 rounded-sm border border-slate-700 px-2 py-1"
            key={index}
          >
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

export function ChallengeWrapper({
  id,
  active,
  ref,
  children,
}: PinyinChallengeProps) {
  return (
    <motion.div
      layout="position"
      layoutId={id}
      className={clsx(
        "flex min-w-64 max-w-sm flex-col items-center gap-2 rounded-md border-2 bg-white p-2 md:max-w-md lg:max-w-lg",
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
