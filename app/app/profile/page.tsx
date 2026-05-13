import { Mail, Phone, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { ProfileForm } from "@/components/app/profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({ title: "Profile" });

export default async function ProfilePage() {
  const context = await getAppContext();
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);
  const userName = context.profile?.fullName || context.user.email;
  const initial = (userName || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Profile"
        badge={context.activeTeam ? "Team member" : "Personal"}
        title="Your account"
        description="Profile details, role, and active team."
      />

      {/* Identity card */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 font-display text-xl font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold text-text-primary">
                {context.profile?.fullName || "Set your name"}
              </p>
              <p className="mt-0.5 truncate text-sm text-text-secondary">{context.user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant={roleVariant}>{roleLabel}</Badge>
                {context.activeTeam ? (
                  <Badge variant="navy">{context.activeTeam.name}</Badge>
                ) : (
                  <Badge variant="subtle">No team</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <InfoTile icon={Mail} label="Email" value={context.user.email} />
            <InfoTile icon={Phone} label="Phone" value={context.profile?.phone || "Not set"} />
            <InfoTile icon={Users2} label="Team" value={context.activeTeam?.name || "—"} />
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardContent className="space-y-5">
          <SectionHeader eyebrow="Edit" title="Profile details" description="Your name and phone appear across the team." />
          <ProfileForm
            defaultValues={{
              fullName: context.profile?.fullName || "",
              phone: context.profile?.phone || "",
            }}
          />
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-text-primary">Sign out</p>
            <p className="mt-0.5 text-sm text-text-secondary">End this session on this device.</p>
          </div>
          <SignOutButton variant="outline" className="sm:w-auto" />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-text-muted" />
        <p className="text-2xs uppercase tracking-wide text-text-muted">{label}</p>
      </div>
      <p className="mt-1 truncate font-medium text-text-primary">{value}</p>
    </div>
  );
}
