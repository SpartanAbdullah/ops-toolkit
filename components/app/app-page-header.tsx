import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AppPageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AppPageHeader({ eyebrow, title, description, badge, actions, className }: AppPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          {badge ? <Badge variant="navy">{badge}</Badge> : null}
        </div>
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-text-primary sm:text-[32px]">
          {title}
        </h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
