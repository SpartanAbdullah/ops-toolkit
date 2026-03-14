import { AppRole } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapMembershipRoleToAppRole } from "@/lib/app/team";

async function ensureUserRecord(authUser: SupabaseUser) {
  const existingUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      profile: true,
      activeTeam: true,
      teamMemberships: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!existingUser) {
    const fullName =
      typeof authUser.user_metadata.full_name === "string"
        ? authUser.user_metadata.full_name
        : typeof authUser.user_metadata.name === "string"
          ? authUser.user_metadata.name
          : null;

    return prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? "",
        role: AppRole.individual,
        profile: {
          create: {
            fullName,
            phone: authUser.phone ?? null,
          },
        },
      },
      include: {
        profile: true,
        activeTeam: true,
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  const updates: {
    email?: string;
    activeTeamId?: string | null;
    role?: AppRole;
  } = {};

  if ((authUser.email ?? "") && existingUser.email !== authUser.email) {
    updates.email = authUser.email ?? existingUser.email;
  }

  const hasActiveMembership = existingUser.activeTeamId
    ? existingUser.teamMemberships.some((membership) => membership.teamId === existingUser.activeTeamId)
    : false;

  if (existingUser.activeTeamId && !hasActiveMembership) {
    updates.activeTeamId = null;
    updates.role = AppRole.individual;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: updates,
    });
  }

  if (!existingUser.profile) {
    await prisma.profile.create({
      data: {
        userId: existingUser.id,
        fullName:
          typeof authUser.user_metadata.full_name === "string"
            ? authUser.user_metadata.full_name
            : typeof authUser.user_metadata.name === "string"
              ? authUser.user_metadata.name
              : null,
        phone: authUser.phone ?? null,
      },
    });
  }

  const freshUser = await prisma.user.findUniqueOrThrow({
    where: { id: authUser.id },
    include: {
      profile: true,
      activeTeam: true,
      teamMemberships: {
        include: {
          team: true,
        },
      },
    },
  });

  const activeMembership = freshUser.activeTeamId
    ? freshUser.teamMemberships.find((membership) => membership.teamId === freshUser.activeTeamId) ?? null
    : null;
  const nextRole = mapMembershipRoleToAppRole(activeMembership?.role);

  if (freshUser.role !== nextRole) {
    return prisma.user.update({
      where: { id: freshUser.id },
      data: { role: nextRole },
      include: {
        profile: true,
        activeTeam: true,
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  return freshUser;
}

export const getAppContext = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?next=/app");
  }

  const user = await ensureUserRecord(authUser);
  const activeMembership = user.activeTeamId
    ? user.teamMemberships.find((membership) => membership.teamId === user.activeTeamId) ?? null
    : null;

  return {
    authUser,
    user,
    profile: user.profile,
    activeTeam: user.activeTeam,
    activeMembership,
    resolvedRole: mapMembershipRoleToAppRole(activeMembership?.role),
  };
});

export async function getRecentActivity(limit = 6) {
  const context = await getAppContext();

  return prisma.auditLog.findMany({
    where: context.activeTeam
      ? {
          OR: [
            { teamId: context.activeTeam.id },
            { actorUserId: context.user.id },
          ],
        }
      : { actorUserId: context.user.id },
    include: {
      actor: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

export async function getUnreadNotificationCount() {
  const context = await getAppContext();

  return prisma.notification.count({
    where: {
      userId: context.user.id,
      readAt: null,
    },
  });
}