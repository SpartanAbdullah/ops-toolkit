import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tap-highlight inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white shadow-soft hover:bg-primary-700",
        secondary: "border border-border bg-white text-text-primary shadow-sm hover:border-primary-600/20 hover:bg-primary-50",
        ghost: "text-text-secondary hover:bg-primary-50 hover:text-primary-700",
        outline: "border border-border bg-background text-text-primary hover:border-primary-600/25 hover:bg-white",
        danger: "bg-danger-600 text-white shadow-soft hover:bg-red-700",
      },
      size: {
        default: "h-12 px-5 text-[15px]",
        lg: "h-14 px-6 text-base",
        sm: "h-10 px-4 text-sm",
        icon: "h-11 w-11 rounded-xl",
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
