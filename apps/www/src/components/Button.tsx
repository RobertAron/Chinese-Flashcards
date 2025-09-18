import clsx from "clsx";
import { buttonBehaviorClasses } from "./coreClasses";

type ButtonProps = React.ComponentPropsWithRef<'button'>;
export const Button = ({ className, ...restProps }: ButtonProps) => (
  <button {...restProps} className={clsx(buttonBehaviorClasses, className)} />
);
