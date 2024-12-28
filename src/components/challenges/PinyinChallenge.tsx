"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { Ref, useEffect, useState } from "react";

type PinyinChallengeProps = {
  character: string;
  pinyin: string;
  definition: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function PinyinChallenge({
  character,
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
  definition,
}: PinyinChallengeProps) {
  const normalized = pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const cb = (e: KeyboardEvent) => {
      const requiredLetter = normalized[progress];
      const onLastLetter = progress === normalized.length - 1;
      if (e.key === requiredLetter) {
        setProgress(progress + 1);
        if (onLastLetter) onComplete?.();
      }
    };
    window.addEventListener("keydown", cb);
    return () => window.removeEventListener("keydown", cb);
  }, [active, normalized, progress, onComplete]);

  return (
    <motion.div
      layout="position"
      layoutId={id}
      className={clsx(
        "flex w-64 flex-col items-center gap-2 rounded-md border-2 bg-white p-2",
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
      <div className="text-center text-4xl">{character}</div>
      <div className="text-pretty text-center text-sm">{definition}</div>
      <div className="flex justify-center gap-[0.05em] text-center font-mono text-xl tracking-tighter">
        {pinyin
          .split("")
          .slice(0, progress)
          .map((ele, index) => (
            <span
              className={clsx("text-black", {
                "decoration-skip-ink-none underline decoration-black": practice,
              })}
              key={index}
            >
              {ele}
            </span>
          ))}
        {pinyin
          .split("")
          .map((ele) => (practice ? ele : "·"))
          .slice(progress)
          .map((ele, index) => (
            <motion.span
              className={clsx("text-slate-400", {
                "decoration-skip-ink-none underline decoration-black": practice,
              })}
              initial={{ color: "#94a3b800" }}
              animate={active ? "active" : "initial"}
              transition={{
                duration: practice ? 1 : 0,
                delay: practice ? 2 : 0,
              }}
              variants={{
                initial: { color: "#94a3b800" },
                active: { color: "#94a3b8FF" },
              }}
              key={index}
            >
              {ele}
            </motion.span>
          ))}
      </div>
    </motion.div>
  );
}
