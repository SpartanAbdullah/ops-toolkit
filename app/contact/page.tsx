import Link from "next/link";
import { ArrowRight, ClipboardList, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { contactChannels, featuredTools } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

const contactIcons = [Mail, Sparkles, ShieldCheck];

const contactPrep = [
  {
    title: "Current workflow",
    description: "Tell us what still lives in spreadsheets, WhatsApp, notebooks, or manual calculations today.",
    icon: ClipboardList,
    tone: "blue" as const,
  },
  {
    title: "Team context",
    description: "Include your team size, department, and whether the workflow is single-operator or shared across admins and workers.",
    icon: Sparkles,
    tone: "purple" as const,
  },
  {
    title: "Desired outcome",
    description: "Let us know whether you need clearer tracking, approval flow, export support, payment visibility, or a better audit trail.",
    icon: ShieldCheck,
    tone: "green" as const,
  },
];

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Ops Toolkit for pricing, demos, support, roadmap questions, or help evaluating which operational workflow to improve first.",
  path: "/contact",
  keywords: ["contact ops toolkit", "operations software demo", "ops toolkit support"],
});

export default function ContactPage() {
  const liveTools = featuredTools.filter((tool) => tool.live).slice(0, 2);

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to us about the <span className="text-gradient">operational workflow</span> you want to fix next
          </>
        }
        description="Use this page when you want help choosing the right tool, understanding pricing, planning a team rollout, or replacing a manual process that has outgrown spreadsheets and chat threads."
        actions={[
          { label: "Email sales", href: "mailto:sales@opstoolkit.app" },
          { label: "Explore pricing", href: "/pricing", variant: "secondary" },
        ]}
        note="The fastest messages include your current workflow, team size, and what still feels messy or hard to trust today."
      />
      <SectionShell
        title="Choose the fastest route"
        description="Contact options are organized by intent so teams can reach the right person without guessing."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {contactChannels.map((channel, index) => {
            const Icon = contactIcons[index] ?? Mail;
            return (
              <Card key={channel.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <IconTile icon={Icon} tone={channel.tone} />
                    <CardTitle className="text-xl">{channel.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-7 text-slate-600">{channel.description}</p>
                  <Button asChild variant="secondary" className="w-full justify-between">
                    <Link href={channel.href}>
                      {channel.value}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell
        title="What to include in your message"
        description="A little context helps us point you to the right tool, plan, or workflow path much faster."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {contactPrep.map((item) => (
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
        title="Good starting points before you email"
        description="If you want to try the product first, these live tools show the design quality, output clarity, and workflow approach immediately."
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