import { TeamMemberRole } from "@prisma/client";
import { ShieldCheck, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { CreateTeamForm, JoinTeamForm, RegenerateJoinCodeButton } from "@/components/app/team-forms";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({ title: "Team" });

export default async function TeamPage() {
  const context = await getAppContext();
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);
  const isAdmin = context.activeMembership?.role === TeamMemberRole.admin;

  const teamData = context.activeTeam
    ? await prisma.team.findUnique({
        where: { id: context.activeTeam.id },
        include: {
          members: {
            include: { user: { include: { profile: true } } },
            orderBy: { createdAt: "asc" },
          },
          inviteCodes: {
            where: { revokedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    : null;

  return (
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Team"
        badge={teamData ? `${teamData.members.length} member${teamData.members.length === 1 ? "" : "s"}` : "No team"}
        title={teamData?.name ?? "Set up your workspace"}
        description={teamData ? "Members, role, and the active join code." : "Create a team or join with a code."}
      />

      {!teamData ? (
        <>
          <Card>
            <CardContent className="space-y-5">
              <SectionHeader
                eyebrow="Create"
                title="Start a new team"
                description="One workspace for OT, petty cash, and approvals."
              />
              <CreateTeamForm />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5">
              <SectionHeader
                eyebrow="Join"
                title="Join with a code"
                description="Use the 6-character code shared by an admin."
              />
              <JoinTeamForm />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Join code card */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="section-label">Active join code</p>
                  <p className="font-display text-3xl font-semibold tracking-[0.18em] text-text-primary">
                    {teamData.inviteCodes[0]?.code ?? "------"}
                  </p>
                  <p className="text-2xs text-text-muted">Share with new members to join the workspace.</p>
                </div>
                <Badge variant={roleVariant}>{roleLabel}</Badge>
              </div>
              {isAdmin ? (
                <RegenerateJoinCodeButton />
              ) : (
                <Callout
                  title="Workers can view the code"
                  description="Only admins can rotate the join code."
                  icon={ShieldCheck}
                  tone="navy"
                />
              )}
            </CardContent>
          </Card>

          {/* Members list */}
          <Card>
            <CardContent className="space-y-4">
              <SectionHeader
                eyebrow="Members"
                title={`${teamData.members.length} ${teamData.members.length === 1 ? "person" : "people"}`}
              />
              <div className="space-y-2">
                {teamData.members.map((member) => {
                  const memberRoleLabel = getRoleLabel(member.role);
                  const memberVariant = getRoleBadgeVariant(member.role);
                  const name = member.user.profile?.fullName || member.user.email;
                  const initial = name.trim().charAt(0).toUpperCase();
                  return (
                    <div key={member.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 font-display text-sm font-semibold text-primary-700">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-semibold text-text-primary">{name}</p>
                        <p className="truncate text-2xs text-text-muted">{member.user.email}</p>
                      </div>
                      <Badge variant={memberVariant}>{memberRoleLabel}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {!isAdmin ? (
            <Callout
              title="Need to leave or switch teams?"
              description="Ask an admin to rotate the code or contact ops support."
              icon={Users2}
              tone="slate"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
