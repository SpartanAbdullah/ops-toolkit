import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-3xl border border-border bg-white px-4 py-3 text-base text-text-primary shadow-sm transition placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-text-muted",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
