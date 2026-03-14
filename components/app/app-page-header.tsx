import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageHeaderAction = {
  href: string;
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
};

type AppPageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
  links?: PageHeaderAction[];
  className?: string;
};

export function AppPageHeader({ eyebrow, title, description, badge, actions, links = [], className }: AppPageHeaderProps) {
  return (
    <div className={cn("rounded-[2rem] border border-white/85 bg-white/88 p-6 shadow-card backdrop-blur md:p-8", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {eyebrow ? <p className="hero-chip">{eyebrow}</p> : null}
            {badge ? <Badge variant="subtle">{badge}</Badge> : null}
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        {!actions && links.length ? (
          <div className="flex flex-wrap gap-3">
            {links.map((link, index) => (
              <Button key={link.href} asChild variant={link.variant ?? (index === 0 ? "default" : "secondary")}>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}