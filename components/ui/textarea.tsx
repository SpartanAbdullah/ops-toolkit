import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[110px] w-full rounded-xl border border-border bg-white px-3.5 py-3 text-[15px] text-text-primary transition placeholder:text-text-muted focus-visible:border-accent-500 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
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
