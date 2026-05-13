import { cn } from "@/lib/utils";

type SummaryBlockProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
};

const toneStyles = {
  default: "bg-surface-muted text-text-primary border-border",
  primary: "bg-primary-50 text-primary-700 border-primary-100",
  success: "bg-mint-50 text-mint-600 border-mint-100",
  warning: "bg-accent-50 text-accent-foreground border-accent-100",
  danger: "bg-danger-50 text-danger-600 border-danger-50",
} as const;

export function SummaryBlock({ label, value, hint, tone = "default", className }: SummaryBlockProps) {
  return (
    <div className={cn("rounded-xl border px-4 py-3.5", toneStyles[tone], className)}>
      <p className="text-2xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <div className="mt-1.5 font-display text-base font-semibold leading-tight">{value}</div>
      {hint ? <p className="mt-1.5 text-sm leading-5 opacity-80">{hint}</p> : null}
    </div>
  );
}
