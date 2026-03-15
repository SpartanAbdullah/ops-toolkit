import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-12 w-full appearance-none rounded-2xl border border-border bg-white px-4 pr-11 text-base text-text-primary shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-text-muted",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  ),
);

Select.displayName = "Select";

export { Select };
