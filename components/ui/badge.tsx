import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white",
        subtle: "bg-surface-muted text-text-secondary",
        navy: "bg-primary-50 text-primary-700",
        amber: "bg-accent-50 text-accent-foreground",
        mint: "bg-mint-50 text-mint-600",
        rose: "bg-danger-50 text-danger-600",
        slate: "bg-surface-muted text-text-muted",
        outline: "border border-border bg-white text-text-secondary",
        /* Aliases kept for legacy call sites */
        blue: "bg-primary-50 text-primary-700",
        green: "bg-mint-50 text-mint-600",
        purple: "bg-primary-100 text-primary-700",
        red: "bg-danger-50 text-danger-600",
      },
      size: {
        default: "px-2.5 py-0.5 text-2xs",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
