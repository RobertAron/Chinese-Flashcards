import clsx from "clsx";
import { motion } from "motion/react";
import type { Ref } from "react";

export type ChallengeWrapperProps = {
  id: string;
  active?: boolean;
  ref?: Ref<HTMLDivElement>;
  children?: React.ReactNode;
  className?: string;
};

export function ChallengeWrapper({ id, ref, children, className }: ChallengeWrapperProps) {
  return (
    <motion.div
      layout="position"
      layoutId={id}
      className={clsx(
        "flex min-w-80 max-w-sm flex-col items-center gap-4 rounded-md border-2 border-black bg-white px-3 py-2 md:max-w-md lg:max-w-lg",
        className,
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
