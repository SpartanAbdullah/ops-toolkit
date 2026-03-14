import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeInfo, Lightbulb, Scale } from "lucide-react";
import { notFound } from "next/navigation";

import { SkuBarcodeBatchGenerator } from "@/components/tools/sku-barcode-batch-generator";
import { ToolTemplate } from "@/components/tools/tool-template";
import { OvertimeCalculator } from "@/components/tools/overtime-calculator";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRelatedTools, getToolBySlug, tools } from "@/lib/content";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool",
    };
  }

  return {
    title: tool.name,
    description: tool.description,
  };
}

function ToolPreviewWorkspace({ slug }: { slug: string }) {
  const tool = getToolBySlug(slug);

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Planned workflow inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
          {tool?.previewInputs.map((item) => (
            <div key={item} className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 px-4 py-3">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Planned output experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
          {tool?.previewOutputs.map((item) => (
            <div key={item} className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 px-4 py-3">
              {item}
            </div>
          ))}
          <div className="rounded-[1.4rem] border border-violet-100 bg-violet-50/70 p-4 text-violet-900">
            This page already uses the shared tool template so future releases can drop into the same clear structure without redesigning the experience.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComingSoonSidebar() {
  return (
    <>
      <Callout
        icon={Lightbulb}
        tone="amber"
        title="Built to stay focused"
        description="This tool is being shaped as a single-purpose utility first, with the option to grow into a richer workflow later."
      />
      <Callout
        icon={BadgeInfo}
        tone="blue"
        title="What happens next"
        description="You can still use this page to understand the planned inputs, outputs, and the kind of operational problem this tool will solve."
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="font-display text-2xl font-semibold text-slate-950">Want this tool sooner?</p>
          <p className="text-sm leading-7 text-slate-600">Share the workflow you are trying to standardize and the team using it today.</p>
          <Button asChild className="w-full justify-between">
            <Link href="/contact">
              Request this workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function renderLiveTool(slug: string) {
  if (slug === "uae-overtime-calculator") {
    return {
      workspace: <OvertimeCalculator />,
      sidebar: (
        <>
          <Callout
            icon={Scale}
            tone="blue"
            title="Rule basis used"
            description="The calculator reflects current UAE government guidance for overtime, night work, rest days, and public holidays."
          >
            <ul className="space-y-2">
              <li>Standard day overtime: base hourly wage plus 25%.</li>
              <li>Night overtime: base hourly wage plus 50%.</li>
              <li>Rest day work: estimated at base hourly wage plus 50% if no substitute rest day is granted.</li>
              <li>Public holiday work: estimated at base hourly wage plus 50% if no alternative day off is granted.</li>
            </ul>
          </Callout>
          <Callout
            icon={Lightbulb}
            tone="amber"
            title="Important assumptions"
            description="To keep the formula transparent, this tool converts monthly basic salary to an hourly rate by dividing monthly basic salary by 30 days and by daily working hours."
          >
            <p>Use the company flat-rate mode if your policy uses a custom overtime hourly rate instead of this salary-based estimate.</p>
          </Callout>
          <Callout
            icon={AlertTriangle}
            tone="red"
            title="Policy and legal disclaimer"
            description="Company policy, contract terms, exemptions, and local interpretation may affect final payroll treatment."
          >
            <p>
              Confirm details against the official UAE government guidance on overtime and public holiday compensation before using the output as a payroll decision.
            </p>
            <div className="space-y-2">
              <a className="inline-flex text-sm font-semibold text-rose-700 underline-offset-4 hover:underline" href="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/working-hours." target="_blank" rel="noreferrer">
                Working hours and overtime
              </a>
              <a className="inline-flex text-sm font-semibold text-rose-700 underline-offset-4 hover:underline" href="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/working-hours#overtime-pay-of-private-sector-employees" target="_blank" rel="noreferrer">
                Overtime pay section
              </a>
            </div>
          </Callout>
        </>
      ),
    };
  }

  if (slug === "sku-barcode-batch-generator") {
    return {
      workspace: <SkuBarcodeBatchGenerator />,
      sidebar: (
        <>
          <Callout
            icon={BadgeInfo}
            tone="blue"
            title="Supported barcode types"
            description="Use Code128 for flexible internal SKUs, EAN-13 and UPC-A for retail-style numeric labels, and QR Code for links or richer references."
          >
            <ul className="space-y-2">
              <li>Code128: flexible and practical for internal warehouse or ops labels.</li>
              <li>EAN-13: requires exactly 13 digits.</li>
              <li>UPC-A: requires exactly 12 digits.</li>
              <li>QR Code: supports flexible text, URLs, and identifiers.</li>
            </ul>
          </Callout>
          <Callout
            icon={Lightbulb}
            tone="amber"
            title="Good operational use cases"
            description="This tool works well for receiving labels, internal bin labels, retail relabeling, ecommerce pick-pack identifiers, and small batch print jobs."
          >
            <p>Use CSV upload when the source data already exists in a spreadsheet, and use manual entry for quick one-off labels during floor operations.</p>
          </Callout>
          <Callout
            icon={AlertTriangle}
            tone="red"
            title="Format constraints to watch"
            description="EAN-13 and UPC-A are strict numeric formats. If the data does not match the required length, the row will be flagged before label generation."
          >
            <p>For internal inventory codes that are not fixed retail lengths, Code128 is usually the safest and most flexible choice.</p>
          </Callout>
        </>
      ),
    };
  }

  return null;
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool.slug);
  const liveTool = tool.live ? renderLiveTool(tool.slug) : null;

  if (tool.live && liveTool) {
    return (
      <ToolTemplate tool={tool} relatedTools={relatedTools} sidebar={liveTool.sidebar}>
        {liveTool.workspace}
      </ToolTemplate>
    );
  }

  return (
    <ToolTemplate tool={tool} relatedTools={relatedTools} sidebar={<ComingSoonSidebar />}>
      <ToolPreviewWorkspace slug={tool.slug} />
    </ToolTemplate>
  );
}