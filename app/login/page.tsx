import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Login"
        title={
          <>
            Team workspaces are <span className="text-gradient">coming next</span>
          </>
        }
        description="The current release is focused on polished public tools and discovery. Workspace access, saved records, and collaborative flows are being designed on top of the same clear system."
        actions={[
          { label: "Explore tools", href: "/tools" },
          { label: "Contact sales", href: "/contact", variant: "secondary" },
        ]}
      />
      <SectionShell title="What login will unlock later" description="Future authenticated areas will support saved calculations, role-aware workflows, approvals, and team-level visibility without changing the product’s simple navigation model.">
        <Card className="max-w-3xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-700 shadow-sm">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl">Workspace access preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-sm leading-7 text-slate-600 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl">If you want early access for a shared team workflow, get in touch and describe the operational process you want to structure.</p>
            <Button asChild>
              <Link href="/contact">
                Request access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </SectionShell>
    </div>
  );
}


