import { cn } from "@/lib/utils";

type SummaryBlockProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
};

const toneStyles = {
  default: "bg-slate-50 text-text-primary",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-amber-800",
  danger: "bg-danger-50 text-danger-600",
} as const;

export function SummaryBlock({ label, value, hint, tone = "default", className }: SummaryBlockProps) {
  return (
    <div className={cn("rounded-2xl border border-border px-4 py-4", toneStyles[tone], className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <div className="mt-2 text-lg font-semibold leading-none">{value}</div>
      {hint ? <p className="mt-2 text-sm leading-5 text-text-secondary">{hint}</p> : null}
    </div>
  );
}
