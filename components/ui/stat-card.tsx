import type { LucideIcon } from "lucide-react";

import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  tone?: IconTone;
  accent?: React.ReactNode;
  className?: string;
  trend?: { label: string; tone?: "positive" | "negative" | "neutral" };
};

const trendStyles = {
  positive: "text-mint-600",
  negative: "text-danger-600",
  neutral: "text-text-muted",
};

export function StatCard({ label, value, description, icon, tone = "navy", accent, className, trend }: StatCardProps) {
  return (
    <div className={cn("flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
        {icon ? <IconTile icon={icon} tone={tone} size="sm" /> : null}
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px] sm:leading-tight">
        {value}
      </div>
      {description ? <p className="text-sm leading-5 text-text-secondary">{description}</p> : null}
      {trend ? <p className={cn("text-xs font-medium", trendStyles[trend.tone ?? "neutral"])}>{trend.label}</p> : null}
      {accent ? <div className="pt-1">{accent}</div> : null}
    </div>
  );
}
