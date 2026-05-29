import { AppRole, Prisma } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapMembershipRoleToAppRole } from "@/lib/app/team";

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function hasVerifiedEmail(authUser: SupabaseUser): boolean {
  const verification = authUser as SupabaseUser & {
    confirmed_at?: string | null;
    email_confirmed_at?: string | null;
  };
  return Boolean(authUser.email && (verification.email_confirmed_at || verification.confirmed_at));
}

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

export async function ensureUserRecord(authUser: SupabaseUser) {
  let existingUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: USER_INCLUDE,
  });

  // First-time login — create the User + Profile together. If a concurrent request
  // won the race, P2002 fires; fall back to fetching what they wrote.
  if (!existingUser) {
    try {
      return await prisma.user.create({
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
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
      // Re-fetch by auth id first; if the auth user was recreated, recover by
      // verified email so an existing workspace account does not crash on /app.
      existingUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: USER_INCLUDE,
      });
      if (!existingUser && hasVerifiedEmail(authUser)) {
        existingUser = await prisma.user.findUnique({
          where: { email: authUser.email },
          include: USER_INCLUDE,
        });
      }
      if (!existingUser) {
        throw error;
      }
    }
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

  // Slow path — reconciliation needed. Run both fixups in parallel.
  // Each one swallows P2002 so a concurrent request doing the same thing doesn't crash this one.
  await Promise.all([
    needsUserUpdate
      ? prisma.user
          .update({
            where: { id: existingUser.id },
            data: updates,
          })
          .catch((error) => {
            if (isUniqueConstraintError(error)) return null;
            throw error;
          })
      : Promise.resolve(null),
    needsProfileCreate
      ? prisma.profile
          .create({
            data: {
              userId: existingUser.id,
              fullName: extractFullName(authUser),
              phone: authUser.phone ?? null,
            },
          })
          .catch((error) => {
            // Profile created by a concurrent request — that's fine, swallow it
            if (isUniqueConstraintError(error)) return null;
            throw error;
          })
      : Promise.resolve(null),
  ]);

  // Re-fetch once to return a consistent state regardless of which paths ran
  return prisma.user.findUniqueOrThrow({
    where: { id: existingUser.id },
    include: USER_INCLUDE,
  });
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
