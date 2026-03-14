"use server";

import { AppRole, TeamMemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { generateUniqueJoinCode, generateUniqueTeamSlug, mapMembershipRoleToAppRole } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { parseDateInputToUtcNoon } from "@/lib/overtime";
import { prisma } from "@/lib/prisma";
import { profileSchema, type ProfileValues } from "@/lib/validation/profile";
import { createTeamSchema, joinTeamSchema, type CreateTeamValues, type JoinTeamValues } from "@/lib/validation/team";

type ActionResult<TFields extends string = string, TData = undefined> = {
  status: "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<TFields, string>>;
  data?: TData;
};

function getFieldErrors<TFields extends string>(error: z.ZodError) {
  return error.issues.reduce<Partial<Record<TFields, string>>>((accumulator, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !accumulator[field as TFields]) {
      accumulator[field as TFields] = issue.message;
    }
    return accumulator;
  }, {});
}

function parseOptionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateProfileAction(values: ProfileValues): Promise<ActionResult<keyof ProfileValues>> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: getFieldErrors<keyof ProfileValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  const phone = parsed.data.phone.trim() || null;

  await prisma.$transaction([
    prisma.profile.upsert({
      where: { userId: context.user.id },
      update: {
        fullName: parsed.data.fullName.trim(),
        phone,
      },
      create: {
        userId: context.user.id,
        fullName: parsed.data.fullName.trim(),
        phone,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: context.user.id,
        teamId: context.activeTeam?.id,
        action: "profile.updated",
        entityType: "Profile",
        entityId: context.user.id,
        summary: "Updated profile details.",
      },
    }),
  ]);

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/settings");

  return {
    status: "success",
    message: "Profile updated.",
  };
}

export async function createTeamAction(values: CreateTeamValues): Promise<ActionResult<keyof CreateTeamValues, { joinCode: string }>> {
  const parsed = createTeamSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the team details.",
      fieldErrors: getFieldErrors<keyof CreateTeamValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  if (context.activeTeam) {
    return {
      status: "error",
      message: "This account already has an active team. Switching teams can be added later.",
    };
  }

  const teamName = parsed.data.name.trim();
  const joinCode = await generateUniqueJoinCode();
  const slug = await generateUniqueTeamSlug(teamName);

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: teamName,
        slug,
        ownerId: context.user.id,
      },
    });

    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId: context.user.id,
        role: TeamMemberRole.admin,
      },
    });

    await tx.teamInviteCode.create({
      data: {
        teamId: team.id,
        code: joinCode,
        createdByUserId: context.user.id,
      },
    });

    await tx.overtimeSettings.create({
      data: {
        teamId: team.id,
        calculationMode: parsed.data.calculationMode,
        standardDailyHours: Number(parsed.data.standardDailyHours),
        simpleHourlyRate: parseOptionalNumber(parsed.data.fixedHourlyRate),
        weekendDays: parsed.data.weekendDays,
        ramadanEnabled: parsed.data.ramadanEnabled,
        ramadanStartDate: parsed.data.ramadanEnabled && parsed.data.ramadanStartDate ? parseDateInputToUtcNoon(parsed.data.ramadanStartDate) : null,
        ramadanEndDate: parsed.data.ramadanEnabled && parsed.data.ramadanEndDate ? parseDateInputToUtcNoon(parsed.data.ramadanEndDate) : null,
      },
    });

    await tx.user.update({
      where: { id: context.user.id },
      data: {
        activeTeamId: team.id,
        role: AppRole.admin,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: team.id,
        actorUserId: context.user.id,
        action: "team.created",
        entityType: "Team",
        entityId: team.id,
        summary: `Created the ${team.name} workspace.`,
        details: {
          joinCode,
          overtimeMode: parsed.data.calculationMode,
        },
      },
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/team");
  revalidatePath("/app/profile");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: `Team created. Your join code is ${joinCode}.`,
    data: {
      joinCode,
    },
  };
}

export async function joinTeamAction(values: JoinTeamValues): Promise<ActionResult<keyof JoinTeamValues, { teamName: string }>> {
  const parsed = joinTeamSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the join code.",
      fieldErrors: getFieldErrors<keyof JoinTeamValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  if (context.activeTeam) {
    return {
      status: "error",
      message: "This account already has an active team. Switching teams can be added later.",
    };
  }

  const inviteCode = await prisma.teamInviteCode.findFirst({
    where: {
      code: parsed.data.code,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      team: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!inviteCode) {
    return {
      status: "error",
      message: "That join code is not active. Ask an admin for a fresh code.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const membership = await tx.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: inviteCode.teamId,
          userId: context.user.id,
        },
      },
      update: {},
      create: {
        teamId: inviteCode.teamId,
        userId: context.user.id,
        role: TeamMemberRole.worker,
      },
    });

    await tx.teamInviteCode.update({
      where: { id: inviteCode.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: context.user.id },
      data: {
        activeTeamId: inviteCode.teamId,
        role: mapMembershipRoleToAppRole(membership.role),
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: inviteCode.teamId,
        actorUserId: context.user.id,
        action: "team.joined",
        entityType: "TeamMember",
        entityId: membership.id,
        summary: `Joined the ${inviteCode.team.name} workspace.`,
        details: {
          code: inviteCode.code,
        },
      },
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/team");
  revalidatePath("/app/profile");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: `Joined ${inviteCode.team.name}.`,
    data: {
      teamName: inviteCode.team.name,
    },
  };
}

export async function regenerateJoinCodeAction(): Promise<ActionResult<never, { joinCode: string }>> {
  const context = await getAppContext();
  if (!context.activeTeam || context.activeMembership?.role !== TeamMemberRole.admin) {
    return {
      status: "error",
      message: "Only team admins can rotate the join code.",
    };
  }

  const teamId = context.activeTeam.id;
  const joinCode = await generateUniqueJoinCode();

  await prisma.$transaction(async (tx) => {
    await tx.teamInviteCode.updateMany({
      where: {
        teamId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await tx.teamInviteCode.create({
      data: {
        teamId,
        code: joinCode,
        createdByUserId: context.user.id,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId,
        actorUserId: context.user.id,
        action: "team.join_code.regenerated",
        entityType: "TeamInviteCode",
        summary: "Regenerated the active join code.",
        details: {
          joinCode,
        },
      },
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/team");

  return {
    status: "success",
    message: "Join code rotated.",
    data: {
      joinCode,
    },
  };
}