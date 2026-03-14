import { randomInt, randomUUID } from "crypto";

import { AppRole, TeamMemberRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const joinCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeJoinCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export function slugifyTeamName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "ops-team";
}

export async function generateUniqueTeamSlug(name: string) {
  const baseSlug = slugifyTeamName(name);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${randomInt(100, 999)}`;
    const existingTeam = await prisma.team.findUnique({ where: { slug: candidate } });

    if (!existingTeam) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomUUID().slice(0, 6)}`;
}

export async function generateUniqueJoinCode() {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = Array.from({ length: 6 }, () => joinCodeAlphabet[randomInt(0, joinCodeAlphabet.length)]).join("");
    const existingCode = await prisma.teamInviteCode.findUnique({ where: { code: candidate } });

    if (!existingCode) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique join code.");
}

export function mapMembershipRoleToAppRole(role?: TeamMemberRole | null): AppRole {
  if (role === TeamMemberRole.admin) {
    return AppRole.admin;
  }

  if (role === TeamMemberRole.worker) {
    return AppRole.worker;
  }

  return AppRole.individual;
}

export function getRoleLabel(role: AppRole | TeamMemberRole) {
  switch (role) {
    case AppRole.admin:
    case TeamMemberRole.admin:
      return "Admin";
    case AppRole.worker:
    case TeamMemberRole.worker:
      return "Worker";
    default:
      return "Individual";
  }
}

export function getRoleBadgeVariant(role: AppRole | TeamMemberRole) {
  switch (role) {
    case AppRole.admin:
    case TeamMemberRole.admin:
      return "purple" as const;
    case AppRole.worker:
    case TeamMemberRole.worker:
      return "blue" as const;
    default:
      return "green" as const;
  }
}