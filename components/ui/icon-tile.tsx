import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneStyles: Record<IconTone, string> = {
  blue: "border-sky-200/90 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 text-sky-700 shadow-[0_14px_28px_-20px_rgba(14,165,233,0.5)]",
  green: "border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 text-emerald-700 shadow-[0_14px_28px_-20px_rgba(16,185,129,0.42)]",
  purple: "border-violet-200/90 bg-gradient-to-br from-violet-50 via-white to-violet-100/70 text-violet-700 shadow-[0_14px_28px_-20px_rgba(139,92,246,0.42)]",
  amber: "border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-amber-100/70 text-amber-700 shadow-[0_14px_28px_-20px_rgba(245,158,11,0.42)]",
  red: "border-rose-200/90 bg-gradient-to-br from-rose-50 via-white to-rose-100/70 text-rose-700 shadow-[0_14px_28px_-20px_rgba(244,63,94,0.42)]",
};

const sizeStyles = {
  sm: "h-10 w-10 rounded-[1rem] [&>svg]:h-4 [&>svg]:w-4",
  md: "h-12 w-12 rounded-[1.15rem] [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-14 w-14 rounded-[1.25rem] [&>svg]:h-6 [&>svg]:w-6",
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
        "inline-flex items-center justify-center border backdrop-blur-sm",
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