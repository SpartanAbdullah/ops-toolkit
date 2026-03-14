import Link from "next/link";
import { ArrowRight, Mail, PhoneCall, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { contactChannels } from "@/lib/content";

const contactIcons = [Mail, PhoneCall, ShieldCheck];

export default function ContactPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk about the <span className="text-gradient">operational workflow</span> you want to improve
          </>
        }
        description="Whether you want to ask about pricing, the roadmap, or a specific process that is too manual today, this page keeps the next step obvious."
        actions={[
          { label: "Email sales", href: "mailto:sales@opstoolkit.app" },
          { label: "Browse tools", href: "/tools", variant: "secondary" },
        ]}
      />
      <SectionShell title="Choose the fastest route" description="Contact options are organized by intent so teams can reach the right person without guessing.">
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
    </div>
  );
}


