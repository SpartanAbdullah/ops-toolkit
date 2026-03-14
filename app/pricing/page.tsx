import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Users2, Wallet } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { pricingTiers, tools } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

const pricingNotes = [
  {
    title: "What is live today",
    description: "The public tools are ready to use now, and the private workspace already includes petty cash, overtime, profile, team, and export foundations.",
    icon: Wallet,
    tone: "blue" as const,
  },
  {
    title: "When Pro makes sense",
    description: "Choose the paid workspace when you need saved records, filters, exports, role-aware access, and a cleaner operational audit trail.",
    icon: ShieldCheck,
    tone: "purple" as const,
  },
  {
    title: "When to talk to sales",
    description: "If you are rolling out overtime approvals or a shared team workflow, use the sales route so the setup matches how your operation actually runs.",
    icon: Users2,
    tone: "green" as const,
  },
];

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Clear Ops Toolkit pricing for free public tools, protected workspace modules, and shared team workflows. Start small and pay when the process is worth standardizing.",
  path: "/pricing",
  keywords: ["ops toolkit pricing", "petty cash pricing", "overtime management pricing"],
});

export default function PricingPage() {
  const liveTools = tools.filter((tool) => tool.live);

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Pricing designed for <span className="text-gradient">practical adoption</span>, not forced complexity
          </>
        }
        description="Start with public tools at no cost. Move into the protected workspace and team workflows only when saved records, exports, approvals, and shared visibility become operationally necessary."
        actions={[
          { label: "Get started", href: "/signup" },
          { label: "Explore free tools", href: "/tools", variant: "secondary" },
        ]}
        note="The product is intentionally staged: free public utilities first, data-backed workspace modules second, and team rollout support when the workflow needs it."
      />
      <SectionShell
        title="Choose the right operating layer"
        description="The commercial model follows how small teams usually adopt software: prove one workflow first, then add saved data and team structure only when the process is worth standardizing."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={tier.highlight ? "border-sky-100 bg-sky-50/70" : undefined}>
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <p className="font-display text-4xl font-semibold text-slate-950">{tier.price}</p>
                <p className="text-sm leading-6 text-slate-600">{tier.description}</p>
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
                <Button asChild className="w-full justify-between" variant={tier.highlight ? "default" : "secondary"}>
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
        title="How to evaluate the product clearly"
        description="These are the three decisions most teams need to make before they choose a plan or move an existing spreadsheet process into Ops Toolkit."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {pricingNotes.map((item) => (
            <Card key={item.title}>
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
        title="Live starting points"
        description="If you want to evaluate the product before a paid rollout, these public tools give the fastest route into a real workflow."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {liveTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </SectionShell>
    </div>
  );
}