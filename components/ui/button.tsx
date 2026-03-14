import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.2rem] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-slate-950 text-white shadow-soft hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_24px_45px_-26px_rgba(15,23,42,0.45)]",
        secondary:
          "border border-slate-200/80 bg-white/92 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-card",
        ghost:
          "text-slate-700 hover:bg-white/80 hover:text-slate-950",
        outline:
          "border border-slate-200/80 bg-white/40 text-slate-700 hover:border-sky-200 hover:bg-sky-50/70 hover:text-slate-950",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm",
        icon: "h-11 w-11 rounded-[1rem]",
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