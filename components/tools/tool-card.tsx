import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryBadge } from "@/components/ui/category-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Tool } from "@/lib/types";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  tool: Tool;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className={cn("group block h-full", className)}>
      <Card className="relative h-full overflow-hidden border-white/90 bg-white/92 transition duration-300 group-hover:-translate-y-1.5 group-hover:border-sky-100 group-hover:shadow-soft">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 opacity-0 transition duration-300 group-hover:opacity-100" />
        <CardHeader className="space-y-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <IconTile icon={tool.icon} tone={tool.tone} size="lg" />
            <StatusBadge status={tool.status} />
          </div>
          <div className="space-y-3">
            <CategoryBadge category={tool.category} />
            <CardTitle className="text-[1.6rem] leading-tight">{tool.name}</CardTitle>
            <p className="text-sm leading-7 text-slate-600">{tool.shortDescription}</p>
          </div>
        </CardHeader>
        <CardContent className="flex h-full flex-col justify-between gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.15rem] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Setup</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{tool.setupTime}</p>
            </div>
            <div className="rounded-[1.15rem] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Output</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{tool.output}</p>
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-slate-100 bg-white/90 px-4 py-4 shadow-sm transition duration-300 group-hover:border-sky-100 group-hover:bg-sky-50/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Best for</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="max-w-[15rem] text-sm leading-6 text-slate-700">{tool.bestFor}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                {tool.live ? "Open tool" : tool.status === "Pro" ? "See preview" : "View details"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}