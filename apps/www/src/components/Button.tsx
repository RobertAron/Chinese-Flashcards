import clsx from "clsx";
import { buttonBehaviorClasses } from "./coreClasses";
export const Button = ({
  className,
  ...restProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...restProps} className={clsx(buttonBehaviorClasses, className)} />
);
