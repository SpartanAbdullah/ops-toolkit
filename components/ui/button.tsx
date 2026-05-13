import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tap-highlight inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
        secondary:
          "border border-border bg-white text-text-primary hover:border-primary-200 hover:bg-primary-50",
        accent:
          "bg-accent-500 text-primary-700 shadow-sm hover:bg-accent-600 hover:text-white",
        success:
          "bg-mint-500 text-white shadow-sm hover:bg-mint-600",
        ghost: "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
        outline:
          "border border-border bg-transparent text-text-primary hover:border-primary-200 hover:bg-white",
        danger: "bg-danger-600 text-white shadow-sm hover:opacity-90",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 text-[15px]",
        lg: "h-12 px-5 text-base",
        sm: "h-9 px-3 text-sm",
        xs: "h-8 px-2.5 text-xs",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
