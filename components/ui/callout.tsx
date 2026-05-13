import type { LucideIcon } from "lucide-react";

import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneSurfaces: Record<IconTone, string> = {
  navy: "border-primary-100 bg-primary-50/60",
  amber: "border-accent-100 bg-accent-50/60",
  mint: "border-mint-100 bg-mint-50/60",
  rose: "border-danger-50 bg-danger-50/60",
  slate: "border-border bg-surface-muted",
};

type CalloutProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: IconTone;
  children?: React.ReactNode;
  className?: string;
};

export function Callout({ title, description, icon, tone = "navy", children, className }: CalloutProps) {
  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", toneSurfaces[tone], className)}>
      <div className="flex items-start gap-3">
        <IconTile icon={icon} tone={tone} size="sm" />
        <div className="flex-1 space-y-1">
          <p className="font-display text-base font-semibold text-text-primary">{title}</p>
          {description ? <p className="text-sm leading-6 text-text-secondary">{description}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">{children}</div> : null}
    </div>
  );
}
