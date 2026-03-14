import { CircleUserRound, Phone, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { ProfileForm } from "@/components/app/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Profile",
  description: "Manage your Ops Toolkit profile details, display name, phone number, and current workspace identity.",
  path: "/app/profile",
  noIndex: true,
});

export default async function ProfilePage() {
  const context = await getAppContext();
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);

  return (
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Profile"
        badge={context.activeTeam ? "Workspace member" : "Individual account"}
        title="Keep your account details accurate"
        description="Your profile powers the app shell identity, team member list, and the audit trail that future operations workflows will rely on."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <IconTile icon={CircleUserRound} tone="blue" size="lg" />
              <div>
                <CardTitle className="text-2xl">Profile summary</CardTitle>
                <p className="mt-2 text-sm leading-6 text-slate-600">A clean reference for how you appear across the workspace.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{context.profile?.fullName || "Not set"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{context.user.email}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
                <div className="flex items-center gap-3">
                  <IconTile icon={Phone} tone="green" size="sm" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="mt-1 font-semibold text-slate-950">{context.profile?.phone || "Optional"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5">
                <div className="flex items-center gap-3">
                  <IconTile icon={Users2} tone="purple" size="sm" />
                  <div>
                    <p className="text-sm text-slate-500">Current team</p>
                    <p className="mt-1 font-semibold text-slate-950">{context.activeTeam?.name || "No team yet"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={roleVariant}>{roleLabel}</Badge>
              <p className="text-sm text-slate-500">This role comes from your active team membership, or defaults to Individual.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit profile details</CardTitle>
            <p className="text-sm leading-6 text-slate-600">These values are stored in Postgres via Prisma and will feed into future team workflows and activity context.</p>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                fullName: context.profile?.fullName || "",
                phone: context.profile?.phone || "",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}