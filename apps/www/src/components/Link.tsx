"use client";
import clsx from "clsx";
import { MotionLink } from "./MotionLink";

type Props = React.ComponentProps<typeof MotionLink>;
export const Link = ({ className, ...restProps }: Props) => {
  return (
    <MotionLink
      {...restProps}
      className={clsx(
        "border border-black hocus:bg-black p-1 hocus:text-white transition-colors duration-100",
        className,
      )}
    />
  );
};
