import Link from "next/link";
import { ArrowRight, Clock3, Sparkles, Target } from "lucide-react";

import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Tool } from "@/lib/types";

type ToolTemplateProps = {
  tool: Tool;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  relatedTools: Tool[];
};

export function ToolTemplate({ tool, sidebar, children, relatedTools }: ToolTemplateProps) {
  return (
    <div className="pb-20">
      <section className="pt-10 md:pt-16">
        <div className="container">
          <div className="rounded-[2rem] border border-white/80 bg-hero-mesh p-6 shadow-soft md:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <IconTile icon={tool.icon} tone={tool.tone} className="h-14 w-14" />
                  <CategoryBadge category={tool.category} />
                  <StatusBadge status={tool.status} />
                </div>
                <div className="space-y-4">
                  <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    {tool.name}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">{tool.description}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="#tool-workspace">Use this tool</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/tools">Browse all tools</Link>
                  </Button>
                </div>
              </div>
              <Card className="border-white/90 bg-white/90">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Quick summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Best for</p>
                    <p className="mt-2 font-medium text-slate-900">{tool.bestFor}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Setup time</p>
                    <p className="mt-2 font-medium text-slate-900">{tool.setupTime}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Output</p>
                    <p className="mt-2 font-medium text-slate-900">{tool.output}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <SectionShell
        title="Understand the workflow quickly"
        description="Every Ops Toolkit page is structured so users can see the problem, the benefit, and the next action without digging through clutter."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Problem", description: tool.problemSummary, icon: Target },
            { title: "Benefit", description: tool.benefitSummary, icon: Sparkles },
            { title: "Output", description: tool.output, icon: Clock3 },
          ].map((item, index) => (
            <Card key={item.title} className={index === 1 ? "border-sky-100 bg-sky-50/60" : undefined}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <section id="tool-workspace" className="py-4 md:py-8">
        <div className="container grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>{children}</div>
          <div className="space-y-5 xl:sticky xl:top-24">{sidebar}</div>
        </div>
      </section>

      <SectionShell
        title="Frequently asked questions"
        description="Keep the rules, assumptions, and expected usage visible so the tool is easy to trust and easy to adopt."
      >
        <FaqAccordion items={tool.faqs} />
      </SectionShell>

      <SectionShell
        title="Related tools"
        description="Ops Toolkit is designed as a focused library of utilities that can work together across daily operations."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {relatedTools.map((relatedTool) => (
            <ToolCard key={relatedTool.slug} tool={relatedTool} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="secondary" size="lg">
            <Link href="/tools">
              Explore full tools directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SectionShell>
    </div>
  );
}


