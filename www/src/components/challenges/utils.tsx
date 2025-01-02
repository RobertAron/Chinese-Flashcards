import clsx from "clsx";
import { Ref, useEffect, useState } from "react";
import { motion } from "motion/react";

export function useTypeMatchProgress(
  word: string,
  active?: boolean,
  onComplete?: () => void,
) {
  const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  return progress;
}

type WordProgressProps = {
  pinyin: string;
  progress: number;
  practice?: boolean;
  display?: boolean;
  active?: boolean;
};

export function WordProgress({
  pinyin,
  progress,
  practice,
  active,
  display,
}: WordProgressProps) {
  return (
    <div className="flex justify-center gap-[0.05em] text-center font-mono text-xl tracking-tighter">
      {pinyin
        .split("")
        .slice(0, progress)
        .map((ele, index) => (
          <span
            className={clsx("text-black", {
              "underline decoration-black decoration-skip-ink-none": practice,
            })}
            key={index}
          >
            {ele}
          </span>
        ))}
      {pinyin
        .split("")
        .map((ele) => (practice || display ? ele : "·"))
        .slice(progress)
        .map((ele, index) => (
          <motion.span
            className={clsx("text-slate-400", {
              "underline decoration-black decoration-skip-ink-none": practice,
            })}
            initial={{ color: "#94a3b800" }}
            animate={active ? "active" : display ? "display" : "initial"}
            transition={{
              duration: practice ? 1 : 0,
              delay: practice ? 2 : 0,
            }}
            variants={{
              initial: { color: "#94a3b800" },
              active: { color: "#94a3b8FF" },
              display: { color: "#000" },
            }}
            key={index}
          >
            {ele}
          </motion.span>
        ))}
    </div>
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
      {children}
    </motion.div>
  );
}
