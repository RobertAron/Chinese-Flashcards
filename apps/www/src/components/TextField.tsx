import clsx from "clsx";
import { useMemo } from "react";
import {
  FieldError as AriaFieldError,
  Input as AriaInput,
  Label as AriaLabel,
  Text as AriaText,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from "react-aria-components";

interface TextFieldProps extends Omit<AriaTextFieldProps, "className"> {
  label?: string;
  description?: string;
  className?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextField({ label, description, errorMessage, className, ...props }: TextFieldProps) {
  const classes = useMemo(() => {
    return clsx("flex flex-col gap-0.5", className);
  }, [className]);
  return (
    <AriaTextField className={classes} {...props}>
      <AriaLabel className="text-slate-800">{label}</AriaLabel>
      <AriaInput className="rounded-sm border-2 border-black bg-white p-1" />
      {description !== undefined && <AriaText slot="description">{description}</AriaText>}
      <AriaFieldError>{errorMessage}</AriaFieldError>
    </AriaTextField>
  );
}
