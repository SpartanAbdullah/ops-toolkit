import { CheckCircle2, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Tools",
  description:
    "Browse the Ops Toolkit library of focused operations utilities for warehouse work, HR, payroll, admin, finance, logistics, and everyday operational tasks.",
  path: "/tools",
  keywords: ["operations tools directory", "warehouse tools", "HR payroll tools"],
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Tool directory"
        title={
          <>
            A premium library of <span className="text-gradient">focused operations utilities</span>
          </>
        }
        description="Browse by category, understand what each tool does immediately, and move into a single-purpose workflow without dashboard clutter or confusing navigation."
        actions={[
          { label: "Open live calculator", href: "/tools/uae-overtime-calculator" },
          { label: "Talk about your workflow", href: "/contact", variant: "secondary" },
        ]}
        highlights={["Search by category", "Clear status labels", "Responsive card-based browsing"]}
        note="This directory stays intentionally focused so every result feels useful, legible, and easy to act on."
        aside={
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why the directory is card-first</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="flex items-start gap-3 rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <p>Each tool card exposes the category, status, use case, and next action before you click in.</p>
              </div>
              <div className="flex items-start gap-3 rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p>The structure stays reusable, so new utilities can ship without making discovery harder to understand.</p>
              </div>
            </CardContent>
          </Card>
        }
      />
      <SectionShell
        title="Find the right tool fast"
        description="Filter by operational area, search by keyword, and keep the discovery flow obvious on both desktop and mobile."
      >
        <ToolsDirectory initialCategory={resolvedSearchParams.category} />
      </SectionShell>
    </div>
  );
}