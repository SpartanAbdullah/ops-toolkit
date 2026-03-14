import { Mail, ShieldCheck, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { EmailSettingsForm } from "@/components/app/email-settings-form";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext, getUnreadNotificationCount } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Settings",
  description: "Manage account-level settings, email updates, current role visibility, and workspace identity in Ops Toolkit.",
  path: "/app/settings",
  noIndex: true,
});

export default async function SettingsPage() {
  const [context, unreadNotifications] = await Promise.all([getAppContext(), getUnreadNotificationCount()]);
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);

  return (
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Settings"
        badge={context.activeTeam ? "Team account" : "Standalone account"}
        title="Account settings and auth controls"
        description="Supabase handles authentication while Prisma stores the operational profile and team layer. Keep both aligned from this page."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <IconTile icon={Mail} tone="blue" size="lg" />
              <div>
                <CardTitle className="text-2xl">Email and access</CardTitle>
                <p className="mt-2 text-sm leading-6 text-slate-600">Update the email tied to Supabase Auth and review the current access level for this workspace.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <EmailSettingsForm defaultEmail={context.user.email} />
            <Callout
              title="Email changes may require confirmation"
              description="Supabase may send a confirmation link before the new email becomes active, depending on your project settings."
              icon={ShieldCheck}
              tone="amber"
            >
              <p>The app automatically syncs the authenticated email into the Prisma user record on the next protected request.</p>
            </Callout>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Workspace identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
                <p className="text-sm text-slate-500">Current role</p>
                <div className="mt-3 flex items-center gap-3">
                  <Badge variant={roleVariant}>{roleLabel}</Badge>
                  <p className="text-sm text-slate-500">Derived from your active team membership.</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
                <div className="flex items-center gap-3">
                  <IconTile icon={Users2} tone="purple" size="sm" />
                  <div>
                    <p className="text-sm text-slate-500">Current team</p>
                    <p className="mt-1 font-semibold text-slate-950">{context.activeTeam?.name || "No team selected"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
                <p className="text-sm text-slate-500">Unread notifications</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{unreadNotifications}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Private app foundation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">The settings area is intentionally lean. It exposes just the account controls needed today while keeping room for future team settings, policy preferences, and notification routing.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}