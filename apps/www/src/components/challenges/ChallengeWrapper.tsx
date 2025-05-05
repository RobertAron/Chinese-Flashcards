import clsx from "clsx";
import { cubicBezier } from "motion";
import { motion } from "motion/react";
import type { Ref } from "react";

export type ChallengeWrapperProps = {
  active?: boolean;
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
        "flex min-h-60 w-full flex-col items-center gap-4 rounded-md border-2 border-black bg-white px-3 py-2 sm:min-w-md lg:max-w-lg",
        className,
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{
        rotate: [0, 2, 3],
        opacity: [1, 0.9, 0],
        transition: { times: [0, 0.9, 1], duration: fullDuration * 0.6 },
      }}
      transition={{ ease, duration: fullDuration }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
