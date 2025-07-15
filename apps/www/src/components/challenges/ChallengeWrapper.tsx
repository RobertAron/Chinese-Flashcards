import clsx from "clsx";
import { cubicBezier } from "motion";
import { motion } from "motion/react";
import type { Ref } from "react";

export type ChallengeWrapperProps = {
  ref?: Ref<HTMLDivElement>;
  children?: React.ReactNode;
  className?: string;
};

const ease = cubicBezier(0.85, 0, 0.15, 1);
const fullDuration = 0.2;
export function ChallengeWrapper({ ref, children, className }: ChallengeWrapperProps) {
  return (
    <motion.div
      className={clsx(
        "flex min-h-60 w-full flex-col items-center gap-4 rounded-md border-2 border-black bg-white px-3 py-2 sm:w-md lg:w-lg",
        className,
      )}
      initial={{ y: 100, opacity: 0, rotate: 0, scale: 1 }}
      animate={{ transition: { delay: 0.1 }, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      exit={{
        transition: { times: [0, 0.9, 1], duration: fullDuration * 0.6 },
        y: 5,
        opacity: [1, 0.9, 0],
        rotate: [0, 2, 3],
        scale: 1.03,
        z: 10,
      }}
      transition={{ ease, duration: fullDuration }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
