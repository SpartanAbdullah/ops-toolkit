import Link from "next/link";
import { ArrowRight, Database, Mail, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { buildMetadata, siteConfig } from "@/lib/site";

const privacySections = [
  {
    title: "Public pages and inquiry data",
    body: "When you browse public pages or contact Ops Toolkit, information such as your name, email address, and workflow details may be used to respond to your request and understand product demand.",
    icon: Mail,
    tone: "blue" as const,
  },
  {
    title: "Authenticated workspace data",
    body: "Private workspace features store account, profile, team, petty cash, overtime, and notification data so the product can deliver saved workflows, filters, exports, and role-aware access. This data is only meant to support the product experience and related operational records.",
    icon: Database,
    tone: "purple" as const,
  },
  {
    title: "Security and access",
    body: "Authentication runs through Supabase Auth, while operational data is stored in Postgres and accessed through application-level authorization. Teams should still apply their own internal controls for who is allowed to enter or review operational records.",
    icon: ShieldCheck,
    tone: "green" as const,
  },
];

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the Ops Toolkit privacy policy covering public inquiries, authenticated workspace data, and how operational information is handled in the product.",
  path: "/privacy",
  keywords: ["ops toolkit privacy", "operations software privacy policy"],
});

export default function PrivacyPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Privacy Policy"
        title={
          <>
            Clear privacy expectations for a <span className="text-gradient">focused operational product</span>
          </>
        }
        description="This policy is intentionally concise and written to reflect the current product scope: public marketing pages, public tools, and a protected app workspace for saved operational workflows."
        actions={[
          { label: "Contact us", href: "/contact" },
          { label: "View terms", href: "/terms", variant: "secondary" },
        ]}
        note={`Effective ${siteConfig.legalEffectiveDate}. This page should be reviewed again as storage, retention, or customer-specific data handling expands.`}
      />
      <SectionShell
        title="Policy overview"
        description="The product is still focused and staged, so the policy mirrors the current scope and signals where future updates will be needed as more workflows go live."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {privacySections.map((section) => (
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
        title="Questions or requests"
        description="If you need clarification on privacy, data handling, or operational record storage, use the contact route so the right context reaches the team quickly."
      >
        <Card>
          <CardContent className="flex flex-col gap-6 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-display text-2xl font-semibold text-slate-950">Need a privacy clarification?</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Questions can be sent to {siteConfig.supportEmail} or through the contact page with the workflow or account context included.</p>
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