import { CheckCircle2, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata() {
  return { title: "Tools" };
}

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
        description="Browse tools by category, understand what each one does immediately, and move into a single-purpose workflow without dashboard clutter."
        actions={[
          { label: "Open live calculator", href: "/tools/uae-overtime-calculator" },
          { label: "Talk about your workflow", href: "/contact", variant: "secondary" },
        ]}
        highlights={["Search by category", "Clear status labels", "Responsive card-based browsing"]}
        note="This directory is intentionally focused so every result feels useful, legible, and easy to act on."
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
                <p>The structure is reusable, so new utilities can be added without changing how discovery works.</p>
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