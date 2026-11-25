import clsx from "clsx";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { buttonBehaviorClasses } from "./coreClasses";

export const Button = ({ className, ...restProps }: AriaButtonProps) => (
  <AriaButton {...restProps} className={twMerge(clsx(buttonBehaviorClasses, className))} />
);
