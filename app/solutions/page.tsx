import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { solutions } from "@/lib/content";

export default function SolutionsPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Solutions / Use Cases"
        title={
          <>
            Start from the team context, then move into the <span className="text-gradient">right operational utility</span>
          </>
        }
        description="Ops Toolkit is organized so users can discover tools through real team use cases, not only through software categories."
        actions={[
          { label: "Browse tools", href: "/tools" },
          { label: "Contact us", href: "/contact", variant: "secondary" },
        ]}
      />
      <SectionShell title="Use cases organized around operational reality" description="Each use-case page highlights the pain points that matter most for that team and points them toward the right starting tools.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution) => (
            <Card key={solution.slug} className="h-full transition duration-200 hover:-translate-y-1 hover:shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={solution.icon} tone={solution.tone} />
                  <CardTitle className="text-xl">{solution.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-between gap-6">
                <p className="text-sm leading-7 text-slate-600">{solution.summary}</p>
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={`/solutions/${solution.slug}`}>
                    View use case
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


