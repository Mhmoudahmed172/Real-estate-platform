import type { PropsWithChildren } from "react";

type FormFieldProps = PropsWithChildren<{
  label: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}>;

export function FormField({ label, htmlFor, error, helperText, required = false, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-foreground" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-destructive">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <span className="block text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span className="block text-meta">{helperText}</span>
      ) : null}
    </div>
  );
}
