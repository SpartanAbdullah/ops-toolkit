import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneStyles: Record<IconTone, string> = {
  blue: "border-primary-100 bg-primary-50 text-primary-700",
  green: "border-success-50 bg-success-50 text-success-600",
  purple: "border-primary-100 bg-primary-50 text-primary-700",
  amber: "border-warning-50 bg-warning-50 text-warning-600",
  red: "border-danger-50 bg-danger-50 text-danger-600",
};

const sizeStyles = {
  sm: "h-10 w-10 rounded-2xl [&>svg]:h-4 [&>svg]:w-4",
  md: "h-12 w-12 rounded-2xl [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-14 w-14 rounded-3xl [&>svg]:h-6 [&>svg]:w-6",
};

type IconTileProps = {
  icon: LucideIcon;
  tone?: IconTone;
  size?: keyof typeof sizeStyles;
  className?: string;
};

export function IconTile({ icon: Icon, tone = "blue", size = "md", className }: IconTileProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center border",
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
