import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneStyles: Record<IconTone, string> = {
  navy: "bg-primary-50 text-primary-700",
  amber: "bg-accent-50 text-accent-600",
  mint: "bg-mint-50 text-mint-600",
  rose: "bg-danger-50 text-danger-600",
  slate: "bg-surface-muted text-text-secondary",
};

const sizeStyles = {
  sm: "h-9 w-9 rounded-lg [&>svg]:h-4 [&>svg]:w-4",
  md: "h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6",
  xl: "h-14 w-14 rounded-2xl [&>svg]:h-7 [&>svg]:w-7",
};

type IconTileProps = {
  icon: LucideIcon;
  tone?: IconTone;
  size?: keyof typeof sizeStyles;
  className?: string;
};

export function IconTile({ icon: Icon, tone = "navy", size = "md", className }: IconTileProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        toneStyles[tone],
        sizeStyles[size],
        className,
      )}
    >
      <Icon className="shrink-0" />
    </div>
  );
}

export function getToneClasses(tone: IconTone) {
  return toneStyles[tone];
}
