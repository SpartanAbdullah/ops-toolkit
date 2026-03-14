import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers } from "@/lib/content";

export default function PricingPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Pricing designed for <span className="text-gradient">practical adoption</span>, not forced complexity
          </>
        }
        description="Start with focused utilities. Expand into richer workflows, saved states, and team-ready mini-systems only when the need is real."
        actions={[
          { label: "Explore tools", href: "/tools" },
          { label: "Contact sales", href: "/contact", variant: "secondary" },
        ]}
      />
      <SectionShell title="Choose the right operating layer" description="The commercial model matches how small teams usually adopt operations software: one concrete utility first, deeper workflow support second.">
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
    </div>
  );
}


