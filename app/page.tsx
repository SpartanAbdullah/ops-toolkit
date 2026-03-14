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
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  description:
    "Focused operations tools for warehouses, HR teams, admin operators, and small businesses. Start with free public utilities, then move into a protected workspace for petty cash, overtime, and team workflows.",
  path: "/",
  keywords: ["ops toolkit homepage", "operations manager software", "warehouse utility tools"],
});

export default function HomePage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Operations made clearer"
        title={
          <>
            Replace spreadsheet-and-WhatsApp ops with a <span className="text-gradient">clearer operating layer</span>.
          </>
        }
        description="Ops Toolkit helps warehouse teams, HR admins, small businesses, and operations supervisors move repeat work out of scattered spreadsheets, chat threads, and manual calculations into focused tools that are fast to trust and easy to use."
        actions={[
          { label: "Get started", href: "/signup" },
          { label: "Explore live tools", href: "/tools", variant: "secondary" },
        ]}
        note="Public tools are available right away. The private workspace adds saved petty cash, overtime, exports, and team setup when you are ready to standardize the workflow properly."
        highlights={[
          "Free public tools",
          "Protected workspace",
          "Built for UAE-focused teams",
        ]}
        aside={<HeroVisual />}
      />

      <SectionShell
        id="featured-tools"
        eyebrow="Featured tools"
        title="Start with one focused workflow, not a bloated rollout"
        description="Every tool is built to solve one operational job cleanly. Use a live utility today, then add saved modules and team workflows only when the process proves valuable."
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            The fastest path to adoption is usually one practical tool that teams immediately understand and can trust under real working conditions.
          </p>
          <Button asChild variant="secondary">
            <Link href="/tools">
              View tools directory
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
        eyebrow="Who it is for"
        title="Find your starting point by team and workflow"
        description="Ops Toolkit is broad enough to support multiple departments, but structured so each team can still see the right tool, use case, and next step immediately."
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
        title="A practical product philosophy for teams doing repeat operational work"
        description="The goal is not another oversized dashboard. It is a cleaner operating layer with strong hierarchy, obvious actions, and outputs teams can actually rely on."
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
        title="Public utilities and private modules can work together"
        description="Some utilities stay simple forever. Others grow into saved workflows with approvals, records, exports, and team visibility when the job needs more structure."
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
                "Teams can start with a free public tool before they commit to a private workflow rollout.",
                "Saved modules inherit the same card-based navigation, callouts, and hierarchy so training stays light.",
                "The authenticated app foundation already supports petty cash, overtime, team setup, and future approvals.",
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
        title="Use free tools first, then pay when the workflow is worth standardizing"
        description="The pricing model follows how small teams actually adopt software: solve one operational problem now, then add saved data and team structure only when the process proves itself."
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
        eyebrow="Ready to launch a cleaner workflow?"
        title="See the live tools, then move into the workspace when you need saved data"
        description="The product is intentionally simple to evaluate: browse the public tools, test a real workflow, and open the private app when you need persistence, filters, exports, and team structure."
      >
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="flex flex-col gap-6 pt-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-display text-3xl font-semibold tracking-tight">Start where the operational pain is already obvious.</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Free public tools give teams immediate value. The protected workspace takes over when you need history, approvals, exports, and account-level control.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/tools">Explore tools</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell
        eyebrow="FAQ"
        title="Questions teams usually ask before they replace a spreadsheet workflow"
        description="Ops Toolkit is intentionally focused, so the main questions are about fit, launch path, and what happens when a workflow needs saved records or approvals."
        contentClassName="max-w-4xl"
      >
        <FaqAccordion items={homeFaqs} />
      </SectionShell>
    </div>
  );
}