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
};

export function ListRow({ title, subtitle, meta, badges, aside, details, actions, className }: ListRowProps) {
  return (
    <div className={cn("rounded-3xl border border-border bg-white p-4 shadow-card sm:p-5", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-text-primary">{title}</p>
              {badges}
            </div>
            {subtitle ? <div className="text-sm text-text-secondary">{subtitle}</div> : null}
            {meta ? <div className="text-xs uppercase tracking-[0.18em] text-text-muted">{meta}</div> : null}
          </div>
          {aside ? <div className="sm:text-right">{aside}</div> : null}
        </div>
        {details ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-text-secondary">{details}</div> : null}
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
