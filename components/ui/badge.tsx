import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary-600 bg-primary-600 text-white",
        subtle: "border-border bg-white text-text-secondary",
        blue: "border-primary-100 bg-primary-50 text-primary-700",
        green: "border-success-50 bg-success-50 text-success-600",
        purple: "border-primary-100 bg-primary-50 text-primary-700",
        amber: "border-warning-50 bg-warning-50 text-amber-800",
        red: "border-danger-50 bg-danger-50 text-danger-600",
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
