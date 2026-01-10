"use client";
import clsx from "clsx";
import { useId } from "react";
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
  placeholder?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  className,
  placeholder,
  ...props
}: TextFieldProps) {
  const fieldId = useId()
  return (
    <AriaTextField id={fieldId} className={clsx("flex flex-col gap-0.5", className)} {...props}>
      <AriaLabel className="text-slate-800">
        {label}
      </AriaLabel>
      <AriaInput className="rounded-sm border-2 border-black bg-white p-1" placeholder={placeholder} />
      {description !== undefined && <AriaText slot="description">{description}</AriaText>}
      <AriaFieldError>{errorMessage}</AriaFieldError>
    </AriaTextField>
  );
}
