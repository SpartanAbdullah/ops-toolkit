import Link from "next/link";
import { Suspense } from "react";
import { Boxes, ShieldCheck, Users2 } from "lucide-react";

import { SignupForm } from "@/components/auth/signup-form";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Sign Up",
  description: "Create an Ops Toolkit account with email/password or Google and move from public utilities into a protected operational workspace.",
  path: "/signup",
  noIndex: true,
});

const signupHighlights = [
  "Email/password sign up",
  "Google auth",
  "Protected app routes and team setup",
];

const onboardingPoints = [
  {
    title: "Start as an individual",
    description: "Every account starts cleanly, then grows into a team workspace when you create or join an operations group.",
    icon: Boxes,
    tone: "purple" as const,
  },
  {
    title: "Secure access from day one",
    description: "Supabase Auth handles credentials and sessions while Prisma and Postgres back the application data model.",
    icon: ShieldCheck,
    tone: "blue" as const,
  },
  {
    title: "Ready for collaborative modules",
    description: "The team and role model is already in place for saved petty cash records, overtime workflows, and approvals.",
    icon: Users2,
    tone: "green" as const,
  },
];

export default function SignupPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Create Workspace"
        title={
          <>
            Create your <span className="text-gradient">Ops Toolkit account</span>
          </>
        }
        description="Set up your private app access with email/password or Google, then create or join a team to start using the database-backed workspace foundation."
        highlights={signupHighlights}
        note="The public tools stay open, but the private app is where saved workflows, exports, and team rollout now begin."
        aside={
          <Card className="rounded-[2rem] border-white/90 bg-white/94 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-4">
                <IconTile icon={Boxes} tone="purple" size="lg" />
                <div>
                  <CardTitle className="text-2xl">Create account</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Start with a clean individual account, then build out your team workspace.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">Loading sign-up options...</div>}>
                <SignupForm />
              </Suspense>
            </CardContent>
          </Card>
        }
      />
      <SectionShell
        title="Built for the next product layer"
        description="This sign-up flow is the backbone for saved tools and collaborative mini-systems. It adds real accounts, session protection, and team roles without changing the product’s clean card-based UX."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {onboardingPoints.map((point) => (
            <Card key={point.title}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={point.icon} tone={point.tone} />
                  <CardTitle className="text-xl">{point.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:text-sky-700">
            Log in instead
          </Link>
          .
        </p>
      </SectionShell>
    </div>
  );
}