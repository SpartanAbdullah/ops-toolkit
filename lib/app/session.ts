import { AppRole } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapMembershipRoleToAppRole } from "@/lib/app/team";

const USER_INCLUDE = {
  profile: true,
  activeTeam: true,
  teamMemberships: {
    include: {
      team: true,
    },
  },
} as const;

function extractFullName(authUser: SupabaseUser) {
  if (typeof authUser.user_metadata.full_name === "string") return authUser.user_metadata.full_name;
  if (typeof authUser.user_metadata.name === "string") return authUser.user_metadata.name;
  return null;
}

async function ensureUserRecord(authUser: SupabaseUser) {
  const existingUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: USER_INCLUDE,
  });

  // First-time login — create everything in one round trip
  if (!existingUser) {
    return prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? "",
        role: AppRole.individual,
        profile: {
          create: {
            fullName: extractFullName(authUser),
            phone: authUser.phone ?? null,
          },
        },
      },
      include: USER_INCLUDE,
    });
  }

  // Figure out what (if anything) needs reconciling
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
  } else {
    const activeMembership = existingUser.activeTeamId
      ? existingUser.teamMemberships.find((m) => m.teamId === existingUser.activeTeamId) ?? null
      : null;
    const nextRole = mapMembershipRoleToAppRole(activeMembership?.role);
    if (existingUser.role !== nextRole) {
      updates.role = nextRole;
    }
  }

  const needsProfileCreate = !existingUser.profile;
  const needsUserUpdate = Object.keys(updates).length > 0;

  // Fast path — everything is already in sync. ONE query total for the whole context.
  if (!needsUserUpdate && !needsProfileCreate) {
    return existingUser;
  }

  // Slow path — only when reconciliation is genuinely needed. Run both fixups in parallel.
  const [updatedUser] = await Promise.all([
    needsUserUpdate
      ? prisma.user.update({
          where: { id: existingUser.id },
          data: updates,
          include: USER_INCLUDE,
        })
      : Promise.resolve(existingUser),
    needsProfileCreate
      ? prisma.profile.create({
          data: {
            userId: existingUser.id,
            fullName: extractFullName(authUser),
            phone: authUser.phone ?? null,
          },
        })
      : Promise.resolve(null),
  ]);

  // If we created a profile but didn't update the user, the cached user object lacks the profile.
  // Stitch it together instead of re-fetching.
  if (needsProfileCreate && !needsUserUpdate) {
    return {
      ...updatedUser,
      profile: {
        userId: existingUser.id,
        fullName: extractFullName(authUser),
        phone: authUser.phone ?? null,
        timezone: "Asia/Dubai",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  // If we updated the user but didn't have a profile and created one, re-fetch once with everything
  if (needsProfileCreate) {
    return prisma.user.findUniqueOrThrow({
      where: { id: authUser.id },
      include: USER_INCLUDE,
    });
  }

  return updatedUser;
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

export async function getRecentNotifications(limit = 15) {
  const context = await getAppContext();

  return prisma.notification.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      readAt: true,
      createdAt: true,
    },
  });
}
