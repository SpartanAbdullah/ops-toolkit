import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white",
        subtle: "border-slate-200 bg-white/84 text-slate-700 shadow-sm",
        blue: "border-sky-200 bg-sky-50 text-sky-700",
        green: "border-emerald-200 bg-emerald-50 text-emerald-700",
        purple: "border-violet-200 bg-violet-50 text-violet-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        red: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };