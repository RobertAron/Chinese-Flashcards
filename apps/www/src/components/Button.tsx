import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { buttonBehaviorClasses } from "./coreClasses";

type ButtonProps = React.ComponentPropsWithRef<"button">;
export const Button = ({ className, ...restProps }: ButtonProps) => (
  <button {...restProps} className={twMerge(clsx(buttonBehaviorClasses, className))} />
);
