import { CircleAlert } from "lucide-react";

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
        <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900">
          {label}
        </label>
        {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700" role="alert">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}