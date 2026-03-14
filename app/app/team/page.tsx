import { TeamMemberRole } from "@prisma/client";
import { KeyRound, ShieldCheck, Users2 } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { CreateTeamForm, JoinTeamForm, RegenerateJoinCodeButton } from "@/components/app/team-forms";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
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
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Team"
        badge={context.activeTeam ? "Shared workspace" : "No team yet"}
        title="Create or join an operations team"
        description="This is the first shared-data layer for Ops Toolkit. Admins can generate join codes, workers can join existing teams, and future modules will attach their saved records to this workspace."
      />
      {!teamData ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <IconTile icon={Users2} tone="purple" size="lg" />
                <div>
                  <CardTitle className="text-2xl">Create a new team</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Start a workspace for your warehouse, HR desk, admin team, or operations unit.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CreateTeamForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <IconTile icon={KeyRound} tone="blue" size="lg" />
                <div>
                  <CardTitle className="text-2xl">Join with a code</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Use an active six-character code from a team admin to join an existing workspace.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <JoinTeamForm />
              <Callout
                title="One active team per user for now"
                description="The schema already supports broader team membership, but the current UI keeps the active workspace simple and obvious."
                icon={ShieldCheck}
                tone="amber"
              >
                <p>That keeps the MVP clear while still leaving room for multi-team views later.</p>
              </Callout>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Current team</CardTitle>
                  <IconTile icon={Users2} tone="purple" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{teamData.name}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Shared workspace foundation for saved records and approvals.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Your access</CardTitle>
                  <IconTile icon={ShieldCheck} tone="blue" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant={roleVariant}>{roleLabel}</Badge>
                <p className="mt-3 text-sm leading-7 text-slate-600">Admins can rotate codes and manage rollout. Workers are ready for future assigned workflows.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Members</CardTitle>
                  <IconTile icon={Users2} tone="green" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{teamData.members.length}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">The members list is already database-backed and ready for future role-aware modules.</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={KeyRound} tone="amber" size="lg" />
                  <div>
                    <CardTitle className="text-2xl">Team join code</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Share this with new team members so they can attach their account to the workspace.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active code</p>
                  <p className="mt-3 font-display text-4xl font-semibold tracking-[0.22em] text-slate-950">{teamData.inviteCodes[0]?.code ?? "------"}</p>
                </div>
                {context.activeMembership?.role === TeamMemberRole.admin ? (
                  <RegenerateJoinCodeButton />
                ) : (
                  <Callout
                    title="Only admins can rotate the code"
                    description="Workers can view the team and their role, but code management stays with admins."
                    icon={ShieldCheck}
                    tone="blue"
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <IconTile icon={Users2} tone="purple" size="lg" />
                  <div>
                    <CardTitle className="text-2xl">Team members</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Admin visibility into who is attached to the active workspace.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamData.members.map((member) => {
                  const memberRoleLabel = getRoleLabel(member.role);
                  const memberVariant = getRoleBadgeVariant(member.role);
                  return (
                    <div key={member.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{member.user.profile?.fullName || member.user.email}</p>
                          <p className="mt-1 text-sm text-slate-500">{member.user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={memberVariant}>{memberRoleLabel}</Badge>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{member.createdAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}