import Link from "next/link";
import { ArrowRight, Calculator, FileCheck2, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { buildMetadata, siteConfig } from "@/lib/site";

const termsSections = [
  {
    title: "Product scope",
    body: "Ops Toolkit is a utility-oriented product for operational tracking, calculation, and workflow support. It does not replace legal, payroll, accounting, tax, or compliance advice.",
    icon: ShieldCheck,
    tone: "blue" as const,
  },
  {
    title: "Public tools",
    body: "Public tools, including the UAE Overtime Calculator and SKU Barcode Batch Generator, are provided for operational support and estimation purposes. Users remain responsible for confirming company policy, contracts, and legal requirements before relying on outputs.",
    icon: Calculator,
    tone: "amber" as const,
  },
  {
    title: "Authenticated workspace",
    body: "Private modules store user-entered operational data such as petty cash records, overtime entries, team membership, and payment checkpoints. Customers remain responsible for how they use the data operationally and who inside the business has access to it.",
    icon: FileCheck2,
    tone: "purple" as const,
  },
];

export const metadata = buildMetadata({
  title: "Terms",
  description:
    "Read the Ops Toolkit terms covering product scope, public tool usage, authenticated workspace responsibilities, and operational use boundaries.",
  path: "/terms",
  keywords: ["ops toolkit terms", "operations software terms of use"],
});

export default function TermsPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Terms"
        title={
          <>
            Simple terms for a <span className="text-gradient">practical operations toolkit</span>
          </>
        }
        description="These terms are written to keep the boundaries of the product clear without burying users in unnecessary legal filler."
        actions={[
          { label: "Contact us", href: "/contact" },
          { label: "View privacy", href: "/privacy", variant: "secondary" },
        ]}
        note={`Effective ${siteConfig.legalEffectiveDate}. As the product expands into more workflow modules, these terms should be updated to match the actual feature set and customer commitments.`}
      />
      <SectionShell
        title="Terms overview"
        description="These points reflect the current product scope: public utilities, protected workspace modules, and a focused operational use case rather than a full enterprise suite."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {termsSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={section.icon} tone={section.tone} />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
      <SectionShell
        title="Questions about usage"
        description="If you need clarification on how the product should be used in your operation, the contact route is the fastest way to get the right answer."
      >
        <Card>
          <CardContent className="flex flex-col gap-6 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-display text-2xl font-semibold text-slate-950">Need help understanding the scope?</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Send the current workflow or use case so the team can respond with the right product, pricing, or rollout guidance.</p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact">
                Contact Ops Toolkit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </SectionShell>
    </div>
  );
}