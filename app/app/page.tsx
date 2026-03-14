import Link from "next/link";
import { ArrowRight, Bell, CreditCard, FolderClock, PercentCircle, ShieldCheck, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext, getRecentActivity, getUnreadNotificationCount } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Workspace Overview",
  description: "Open the private Ops Toolkit workspace overview for saved modules, team activity, notifications, and protected operational tools.",
  path: "/app",
  noIndex: true,
});

const moduleCards = [
  {
    href: "/app/petty-cash",
    title: "Petty Cash",
    description: "Prepared for saved floats, transactions, reconciliation notes, and approval-ready audit trails.",
    icon: CreditCard,
    tone: "green" as const,
  },
  {
    href: "/app/overtime",
    title: "Overtime",
    description: "Ready for team-based overtime entries, approvals, payroll review states, and member visibility.",
    icon: PercentCircle,
    tone: "blue" as const,
  },
  {
    href: "/app/team",
    title: "Team Workspace",
    description: "Create or join a team, manage a shared join code, and view members inside the protected app shell.",
    icon: Users2,
    tone: "purple" as const,
  },
];

export default async function AppDashboardPage() {
  const [context, activity, unreadNotifications] = await Promise.all([getAppContext(), getRecentActivity(6), getUnreadNotificationCount()]);
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);

  return (
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Overview"
        badge={context.activeTeam ? "Team workspace active" : "Individual workspace"}
        title={
          <>
            Welcome back, <span className="text-gradient">{context.profile?.fullName || context.user.email}</span>
          </>
        }
        description="This private app shell now sits behind real Supabase authentication and Prisma-backed data. It gives Ops Toolkit a clean launch point for saved petty cash, overtime workflows, team roles, and approvals."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/app/team">Open team workspace</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/profile">Review profile</Link>
            </Button>
          </div>
        }
      />
      {!context.activeTeam ? (
        <Callout
          title="Your account is ready for team setup"
          description="Create a workspace or join one with a code before you roll out saved workflows to other admins or workers."
          icon={Users2}
          tone="amber"
        >
          <p>Once a team is active, the dashboard will carry shared activity, member context, and module-level collaboration hooks.</p>
        </Callout>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Current role</CardTitle>
              <IconTile icon={ShieldCheck} tone="blue" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant={roleVariant}>{roleLabel}</Badge>
            <p className="mt-3 text-sm leading-7 text-slate-600">Role-aware routes and schema support are in place for future approvals and team permissions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Active team</CardTitle>
              <IconTile icon={Users2} tone="purple" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{context.activeTeam?.name ?? "Not set"}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">One active team per user is supported now, with room for broader team membership later.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Unread notifications</CardTitle>
              <IconTile icon={Bell} tone="green" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{unreadNotifications}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">The notification table is ready for future approval requests, alerts, and reminders.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Core modules</CardTitle>
              <IconTile icon={FolderClock} tone="amber" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">3 ready</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Workspace routes for petty cash, overtime, and team management are already protected and scaffolded.</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Modules ready for real data</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {moduleCards.map((module) => (
              <Link key={module.href} href={module.href} className="group rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <IconTile icon={module.icon} tone={module.tone} />
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-slate-950">{module.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{module.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length ? (
              activity.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">{item.summary}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.actor?.profile?.fullName || item.actor?.email || "System"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.createdAt.toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50/60 px-5 py-6 text-sm leading-7 text-slate-600">
                No activity yet. Creating a team, joining with a code, or updating your profile will start the audit trail.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}