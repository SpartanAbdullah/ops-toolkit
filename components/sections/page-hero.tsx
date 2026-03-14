import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroAction = {
  label: string;
  href: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
};

type PageHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  actions?: HeroAction[];
  className?: string;
  aside?: React.ReactNode;
  highlights?: string[];
  note?: string;
};

export function PageHero({ eyebrow, title, description, actions = [], className, aside, highlights = [], note }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden pt-8 md:pt-12", className)}>
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.1rem] border border-white/85 bg-hero-mesh px-6 py-8 shadow-soft md:px-10 md:py-12 xl:px-12 xl:py-14">
          <div className="pointer-events-none absolute inset-0 panel-grid opacity-[0.14]" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
          <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-center">
            <div className="max-w-3xl space-y-7">
              {eyebrow ? <p className="hero-chip">{eyebrow}</p> : null}
              <div className="space-y-5">
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-5xl lg:text-[4.1rem]">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{description}</p>
              </div>
              {actions.length ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {actions.map((action, index) => (
                    <Button key={action.href + action.label} asChild size="lg" variant={action.variant ?? (index === 0 ? "default" : "secondary")}>
                      <Link href={action.href}>{action.label}</Link>
                    </Button>
                  ))}
                </div>
              ) : null}
              {note ? <p className="text-sm leading-6 text-slate-500">{note}</p> : null}
              {highlights.length ? (
                <div className="flex flex-wrap gap-3">
                  {highlights.map((item) => (
                    <div key={item} className="hero-chip bg-white/90 text-slate-700 shadow-sm normal-case tracking-normal">
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {aside ? <div className="relative max-w-[420px] lg:ml-auto">{aside}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}