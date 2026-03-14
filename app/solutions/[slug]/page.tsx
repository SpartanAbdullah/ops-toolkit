import { notFound } from "next/navigation";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { getSolutionBySlug, solutions, tools } from "@/lib/content";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const relatedTools = tools.filter((tool) => solution.relatedToolSlugs.includes(tool.slug));

  return (
    <div className="pb-20">
      <PageHero
        eyebrow={solution.label}
        title={<>{solution.title}</>}
        description={solution.description}
        actions={[
          { label: "Browse tools", href: "/tools" },
          { label: "Contact us", href: "/contact", variant: "secondary" },
        ]}
        aside={
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <IconTile icon={solution.icon} tone={solution.tone} className="h-14 w-14" />
                <CardTitle className="text-2xl">{solution.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">{solution.summary}</p>
            </CardContent>
          </Card>
        }
      />
      <SectionShell title="Common pain points" description="These are the recurring problems this use case is meant to address first.">
        <div className="grid gap-6 md:grid-cols-3">
          {solution.painPoints.map((painPoint) => (
            <Card key={painPoint}>
              <CardContent className="pt-6 text-sm leading-7 text-slate-600">{painPoint}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
      <SectionShell title="Why Ops Toolkit fits this team" description="The value is not more software. It is clearer operational structure with less manual chasing.">
        <div className="grid gap-6 md:grid-cols-3">
          {solution.benefits.map((benefit) => (
            <Card key={benefit} className="border-sky-100 bg-sky-50/60">
              <CardContent className="pt-6 text-sm leading-7 text-slate-700">{benefit}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
      <SectionShell title="Recommended starting tools" description="These are the clearest first-entry utilities for this team profile.">
        <div className="grid gap-6 lg:grid-cols-3">
          {relatedTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </SectionShell>
    </div>
  );
}