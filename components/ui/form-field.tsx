import { InlineMessage } from "@/components/ui/inline-message";

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export function FormField({ label, hint, error, htmlFor, children }: FormFieldProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        {hint ? <p className="text-sm leading-5 text-text-muted">{hint}</p> : null}
      </div>
      {children}
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
    </div>
  );
}
