import { InlineMessage } from "@/components/ui/inline-message";

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
};

export function FormField({ label, hint, error, htmlFor, children, optional }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        {optional ? <span className="text-2xs uppercase tracking-wide text-text-muted">Optional</span> : null}
      </div>
      {hint ? <p className="text-sm leading-5 text-text-muted">{hint}</p> : null}
      {children}
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
    </div>
  );
}
