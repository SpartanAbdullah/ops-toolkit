import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { CategoryBadge } from "@/components/ui/category-badge";
import { IconTile } from "@/components/ui/icon-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import { companyFacts, featuredTools } from "@/lib/content";

const liveTool = featuredTools.find((tool) => tool.live) ?? featuredTools[0];
const previewTools = featuredTools.filter((tool) => tool.slug !== liveTool.slug).slice(0, 2);

export function HeroVisual() {
  return (
    <div className="relative animate-fade-up">
      <div className="absolute -left-6 top-12 h-24 w-24 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -right-4 bottom-2 h-24 w-24 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative space-y-4">
        <Link href={`/tools/${liveTool.slug}`} className="group block">
          <div className="surface-glass rounded-[1.9rem] p-5 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_26px_48px_-28px_rgba(15,23,42,0.36)]">
            <div className="flex items-center justify-between gap-4">
              <span className="hero-chip bg-white/92 text-slate-700">Featured live tool</span>
              <StatusBadge status={liveTool.status} />
            </div>
            <div className="mt-5 flex items-start gap-4">
              <IconTile icon={liveTool.icon} tone={liveTool.tone} size="lg" />
              <div className="space-y-3">
                <CategoryBadge category={liveTool.category} />
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-slate-950">{liveTool.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{liveTool.shortDescription}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Open calculator
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="grid gap-3 sm:grid-cols-2">
          {previewTools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block">
              <div className="rounded-[1.45rem] border border-white/85 bg-white/88 p-4 shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <IconTile icon={tool.icon} tone={tool.tone} size="sm" />
                  <StatusBadge status={tool.status} />
                </div>
                <p className="mt-4 font-semibold text-slate-950">{tool.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {companyFacts.map((fact) => (
            <div key={fact.label} className="rounded-[1.3rem] border border-white/85 bg-white/86 p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{fact.label}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{fact.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-[1.45rem] border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm text-violet-900 shadow-card">
          <IconTile icon={Sparkles} tone="purple" size="sm" />
          <p className="font-medium">Launch with focused utilities now, then expand into saved workflows and team views later.</p>
        </div>
      </div>
    </div>
  );
}