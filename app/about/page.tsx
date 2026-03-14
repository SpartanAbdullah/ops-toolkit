import Link from "next/link";
import { ArrowRight, Layers3, Sparkles, Users } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";

const principles = [
  {
    title: "Focused, not bloated",
    description: "Ops Toolkit is intentionally a toolbox of utilities and mini-systems, not an attempt to become a giant ERP from day one.",
    icon: Layers3,
    tone: "blue" as const,
  },
  {
    title: "Clear by default",
    description: "Every page is designed so users know where they are, what the tool does, and what they should do next.",
    icon: Sparkles,
    tone: "purple" as const,
  },
  {
    title: "Built around team reality",
    description: "The product is shaped around small businesses, warehouses, admin teams, HR staff, and operations supervisors doing repeat daily work.",
    icon: Users,
    tone: "green" as const,
  },
];

export default function AboutPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="About"
        title={
          <>
            Ops Toolkit is a product for teams that need <span className="text-gradient">practical operational clarity</span>
          </>
        }
        description="The idea is simple: most teams do not need more software sprawl. They need a better operating layer for the recurring utility work that keeps getting pushed into spreadsheets and chat."
        actions={[
          { label: "Explore tools", href: "/tools" },
          { label: "Contact the team", href: "/contact", variant: "secondary" },
        ]}
      />
      <SectionShell title="How the product is positioned" description="Ops Toolkit sits between informal processes and heavyweight software. It gives teams a cleaner way to handle repeat operational work without forcing a giant implementation.">
        <div className="grid gap-6 lg:grid-cols-3">
          {principles.map((item) => (
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
      <SectionShell title="What comes next" description="Some tools will remain lightweight solo utilities. Others may grow into collaborative mini-systems with approvals, shared views, and role-based workflows.">
        <Card>
          <CardContent className="flex flex-col gap-6 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-display text-2xl font-semibold text-slate-950">If you have a repeat operational pain point, it is probably a good fit for this product direction.</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">The product roadmap is driven by repetitive jobs that are too important to leave informal, but too small to justify a heavyweight system rollout.</p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact">
                Talk through a workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </SectionShell>
    </div>
  );
}


