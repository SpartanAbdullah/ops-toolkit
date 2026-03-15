import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-10 text-center shadow-sm", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
