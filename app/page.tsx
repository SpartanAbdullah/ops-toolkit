import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

import { HeroVisual } from "@/components/home/hero-visual";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { featuredTools, homeFaqs, pricingTiers, solutions, whyOpsToolkit, workflowSteps } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Operations made clearer"
        title={
          <>
            Stop running operations through <span className="text-gradient">spreadsheets, messages, and memory</span>.
          </>
        }
        description="Ops Toolkit is a polished micro-SaaS toolbox for small businesses, warehouse teams, HR admins, and operations supervisors who need practical utilities with clear outputs and no dashboard clutter."
        actions={[
          { label: "Explore Tools", href: "/tools" },
          { label: "See Pricing", href: "/pricing", variant: "secondary" },
        ]}
        note="Built for real daily work on warehouse floors, in payroll reviews, and across admin operations where clarity matters more than dashboard sprawl."
        highlights={["1 live calculator now", "4 focused workflows", "Card-first discovery"]}
        aside={<HeroVisual />}
      />

      <SectionShell
        id="featured-tools"
        eyebrow="Featured tools"
        title="Focused utilities with premium card-based discovery"
        description="Every tool is designed to solve one operational job clearly, with visible category, status, use case, and next action."
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Start with a single utility, prove the workflow, and then expand only where operational value is real.
          </p>
          <Button asChild variant="secondary">
            <Link href="/tools">
              Browse all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="solutions"
        eyebrow="Who it's for"
        title="Built for teams doing real operational work every day"
        description="Ops Toolkit is intentionally broad enough to support multiple departments, but focused enough that each team can find the right starting point immediately."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {solutions.slice(0, 4).map((solution) => (
            <Link key={solution.slug} href={`/solutions/${solution.slug}`} className="group block">
              <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-sky-100 group-hover:shadow-soft">
                <CardHeader className="space-y-4">
                  <IconTile icon={solution.icon} tone={solution.tone} size="lg" />
                  <div className="space-y-3">
                    <CardTitle className="text-[1.45rem]">{solution.label}</CardTitle>
                    <p className="text-sm leading-7 text-slate-600">{solution.summary}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    View use case
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Why Ops Toolkit"
        title="A practical product philosophy for modern operations teams"
        description="The goal is not to recreate a giant ERP. It is to provide fast, repeatable operational utilities that feel obvious from the first click."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {whyOpsToolkit.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={item.icon} tone={item.tone} />
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

      <SectionShell
        eyebrow="Workflow showcase"
        title="A toolbox that can support repeat workflows across operations"
        description="Some utilities stay single-user forever. Others can grow into shared mini-systems with approvals, saved records, and team visibility."
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="grid gap-5 pt-7 md:grid-cols-3">
              {workflowSteps.map((item) => (
                <div key={item.step} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <IconTile icon={item.icon} tone={item.tone} />
                    <span className="text-sm font-semibold text-slate-500">Step {item.step}</span>
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">Tool example: {item.tool}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-sky-100 bg-sky-50/70">
            <CardHeader>
              <CardTitle className="text-2xl">Why this structure scales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-700">
              {[
                "Teams can begin with a single utility and expand only when a workflow proves valuable.",
                "The component system keeps cards, forms, and callouts consistent as new tools ship.",
                "Future collaborative features can sit on top of the same clear page and section hierarchy.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-[1.35rem] border border-white/90 bg-white/90 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                  <p>{point}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Pricing preview"
        title="Start with focused utilities, then expand when the workflow proves itself"
        description="The pricing model matches how small teams usually adopt software: solve one concrete process first, add structure later."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={tier.highlight ? "border-sky-100 bg-sky-50/70" : undefined}>
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <p className="font-display text-4xl font-semibold text-slate-950">{tier.price}</p>
                <p className="text-sm leading-7 text-slate-600">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant={tier.highlight ? "default" : "secondary"} className="w-full justify-between">
                  <Link href={tier.ctaHref}>
                    {tier.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="FAQ"
        title="Common questions before you roll it out"
        description="The product is intentionally simple, so the key questions are usually about scope, fit, and how the toolkit grows over time."
        contentClassName="max-w-4xl"
      >
        <FaqAccordion items={homeFaqs} />
      </SectionShell>
    </div>
  );
}