import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, badge, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          {badge ? <Badge variant="subtle">{badge}</Badge> : null}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary sm:text-xl">{title}</h2>
          {description ? <p className="max-w-3xl text-sm leading-6 text-text-secondary">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
