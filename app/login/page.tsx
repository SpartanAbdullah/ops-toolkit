import Link from "next/link";
import { Suspense } from "react";
import { LockKeyhole, ShieldCheck, Workflow } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Login",
  description: "Log in to the private Ops Toolkit workspace for saved team workflows, settings, and protected operational modules.",
  path: "/login",
  noIndex: true,
});

const loginHighlights = [
  "Saved profile and team data",
  "Protected private app routes",
  "Database-backed petty cash and overtime modules",
];

const valuePoints = [
  {
    title: "Real team workspace",
    description: "Move from public tools into a protected app shell with a real user profile, team membership, and saved data foundation.",
    icon: LockKeyhole,
    tone: "blue" as const,
  },
  {
    title: "Role-aware structure",
    description: "The app backbone supports individuals, workers, and admins without bloating the product into an ERP-style dashboard.",
    icon: ShieldCheck,
    tone: "purple" as const,
  },
  {
    title: "Future-ready workflows",
    description: "Petty cash tracking, overtime management, approvals, and activity history now sit on top of a clean shared data model.",
    icon: Workflow,
    tone: "green" as const,
  },
];

export default function LoginPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Workspace Login"
        title={
          <>
            Sign in to your <span className="text-gradient">Ops Toolkit app</span>
          </>
        }
        description="Access your protected workspace, team setup, profile settings, and the private app shell that powers saved petty cash, overtime, exports, and role-aware workflows."
        highlights={loginHighlights}
        note="Google login and email/password authentication are both wired through Supabase Auth."
        aside={
          <Card className="rounded-[2rem] border-white/90 bg-white/94 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-4">
                <IconTile icon={LockKeyhole} tone="blue" size="lg" />
                <div>
                  <CardTitle className="text-2xl">Log in</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Use your email and password or continue with Google.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">Loading login options...</div>}>
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>
        }
      />
      <SectionShell
        title="What the private app unlocks"
        description="The public site stays open and browseable. Login opens the private workspace with protected routes, role-aware team foundations, and profile settings that persist in the database."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {valuePoints.map((point) => (
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
          New here?{" "}
          <Link href="/signup" className="font-semibold text-slate-900 hover:text-sky-700">
            Create your account
          </Link>
          .
        </p>
      </SectionShell>
    </div>
  );
}