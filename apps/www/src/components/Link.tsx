"use client";
import clsx from "clsx";
import { MotionLink } from "./MotionLink";
type Props = React.ComponentProps<typeof MotionLink>;
export const Link = ({ className, ...restProps }: Props) => {
  return (
    <MotionLink
      {...restProps}
      className={clsx(
        "border border-black p-1 transition-colors duration-100 hocus:bg-black hocus:text-white",
        className,
      )}
    />
  );
};
