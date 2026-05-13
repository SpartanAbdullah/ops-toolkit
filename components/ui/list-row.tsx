import { cn } from "@/lib/utils";

type ListRowProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  aside?: React.ReactNode;
  details?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  leading?: React.ReactNode;
};

export function ListRow({ title, subtitle, meta, badges, aside, details, actions, className, leading }: ListRowProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-white p-4 shadow-card transition hover:border-primary-100", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {leading ? <div className="shrink-0">{leading}</div> : null}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-[15px] font-semibold leading-tight text-text-primary">{title}</p>
                {badges}
              </div>
              {subtitle ? <div className="text-sm leading-5 text-text-secondary">{subtitle}</div> : null}
              {meta ? <div className="text-2xs uppercase tracking-wide text-text-muted">{meta}</div> : null}
            </div>
          </div>
          {aside ? <div className="shrink-0 sm:text-right">{aside}</div> : null}
        </div>
        {details ? <div className="rounded-xl bg-surface-muted px-3.5 py-3 text-sm leading-5 text-text-secondary">{details}</div> : null}
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
