import { TeamMemberRole } from "@prisma/client";
import { KeyRound, ShieldCheck, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { CreateTeamForm, JoinTeamForm, RegenerateJoinCodeButton } from "@/components/app/team-forms";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { SummaryBlock } from "@/components/ui/summary-block";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Team",
  description: "Create a team, join with a code, and manage the shared workspace membership inside the private Ops Toolkit app.",
  path: "/app/team",
  noIndex: true,
});

export default async function TeamPage() {
  const context = await getAppContext();
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);

  const teamData = context.activeTeam
    ? await prisma.team.findUnique({
        where: { id: context.activeTeam.id },
        include: {
          members: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          inviteCodes: {
            where: {
              revokedAt: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Teams"
        badge={context.activeTeam ? "Shared workspace active" : "No team yet"}
        title="Create, join, and review your workspace team"
        description="Keep team setup simple: one clear join code, visible member roles, and a structure that works on phone screens."
      />

      {!teamData ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <SectionHeader
                eyebrow="Create"
                title="Start a new team"
                description="Set up a workspace for your warehouse, site, payroll desk, or admin operation."
              />
              <CreateTeamForm />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <SectionHeader
                eyebrow="Join"
                title="Join an existing team"
                description="Use the 6-character code from a team admin."
              />
              <JoinTeamForm />
              <Callout
                title="One active team per user for now"
                description="The model supports broader team membership later, but the current product keeps the active workspace simple."
                icon={ShieldCheck}
                tone="amber"
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Current team"
              value={teamData.name}
              description="Your active workspace name."
              icon={Users2}
              tone="blue"
            />
            <StatCard
              label="Your access"
              value={<Badge variant={roleVariant}>{roleLabel}</Badge>}
              description="Your current role in this workspace."
              icon={ShieldCheck}
              tone="green"
            />
            <StatCard
              label="Members"
              value={teamData.members.length}
              description="People connected to this workspace."
              icon={Users2}
              tone="blue"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card>
              <CardContent className="space-y-5 p-5 sm:p-6">
                <SectionHeader
                  eyebrow="Join code"
                  title="Share this code with your team"
                  description="New members use this code to attach their account to the workspace."
                />
                <SummaryBlock
                  label="Active code"
                  value={<span className="font-display text-3xl tracking-[0.22em]">{teamData.inviteCodes[0]?.code ?? "------"}</span>}
                  hint="Rotate the code any time if you need a new invite."
                  tone="primary"
                />
                {context.activeMembership?.role === TeamMemberRole.admin ? (
                  <RegenerateJoinCodeButton />
                ) : (
                  <Callout
                    title="Only admins can rotate the code"
                    description="Workers can view the code and team details, but admin users manage the invite flow."
                    icon={ShieldCheck}
                    tone="blue"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-5 p-5 sm:p-6">
                <SectionHeader
                  eyebrow="Members"
                  title="People in this workspace"
                  description="Member rows are optimized for quick scanning on mobile."
                />
                <div className="space-y-3">
                  {teamData.members.map((member) => {
                    const memberRoleLabel = getRoleLabel(member.role);
                    const memberVariant = getRoleBadgeVariant(member.role);

                    return (
                      <ListRow
                        key={member.id}
                        title={member.user.profile?.fullName || member.user.email}
                        subtitle={member.user.email}
                        meta={member.createdAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}
                        badges={<Badge variant={memberVariant}>{memberRoleLabel}</Badge>}
                        aside={member.role === TeamMemberRole.admin ? <Badge variant="blue">Admin</Badge> : <Badge variant="subtle">Member</Badge>}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
