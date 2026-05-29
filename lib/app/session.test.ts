import { AppRole, Prisma } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    profile: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  };
});

import { ensureUserRecord } from "./session";

function p2002EmailError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed on email", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: ["email"] },
  });
}

function authUser(overrides: Partial<SupabaseUser> = {}): SupabaseUser {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    email: "ops@example.com",
    phone: "",
    user_metadata: {},
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as SupabaseUser;
}

function appUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    email: "ops@example.com",
    role: AppRole.individual,
    activeTeamId: null,
    profile: {
      userId: "22222222-2222-2222-2222-222222222222",
      fullName: null,
      phone: null,
      timezone: "Asia/Dubai",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    activeTeam: null,
    teamMemberships: [],
    ...overrides,
  };
}

describe("ensureUserRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recovers by verified email when the app user exists under an older auth id", async () => {
    const existingUser = appUser();

    mocks.prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);
    mocks.prisma.user.create.mockRejectedValueOnce(p2002EmailError());

    const result = await ensureUserRecord(authUser({ email_confirmed_at: "2026-01-01T00:00:00.000Z" } as Partial<SupabaseUser>));

    expect(result).toBe(existingUser);
    expect(mocks.prisma.user.findUnique).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ where: { email: "ops@example.com" } }),
    );
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
    expect(mocks.prisma.profile.create).not.toHaveBeenCalled();
  });

  it("does not recover an email collision for an unverified auth email", async () => {
    const error = p2002EmailError();

    mocks.prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mocks.prisma.user.create.mockRejectedValueOnce(error);

    await expect(ensureUserRecord(authUser())).rejects.toBe(error);

    expect(mocks.prisma.user.findUnique).toHaveBeenCalledTimes(2);
  });
});
