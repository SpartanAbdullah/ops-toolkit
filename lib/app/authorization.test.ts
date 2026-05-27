import { TeamMemberRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canManageOvertimePayroll,
  canManageOvertimeSettings,
  canManagePettyCashLedger,
  canManageTeamInvites,
  canReviewOvertimeEntries,
  canViewPettyCashLedger,
  canViewTeamOvertime,
  isTeamMember,
} from "./authorization";

describe("authorization boundaries", () => {
  it("requires a team role before operational access is granted", () => {
    expect(isTeamMember(null)).toBe(false);
    expect(canViewTeamOvertime(null)).toBe(false);
    expect(canViewPettyCashLedger(undefined)).toBe(false);
  });

  it("allows owners and admins to manage workspace-level settings", () => {
    expect(canManageTeamInvites(TeamMemberRole.owner)).toBe(true);
    expect(canManageTeamInvites(TeamMemberRole.admin)).toBe(true);
    expect(canManageOvertimeSettings(TeamMemberRole.owner)).toBe(true);
    expect(canManageOvertimeSettings(TeamMemberRole.admin)).toBe(true);
    expect(canManageOvertimeSettings(TeamMemberRole.supervisor)).toBe(false);
    expect(canManageTeamInvites(TeamMemberRole.finance)).toBe(false);
  });

  it("allows supervisors to review overtime without granting payroll authority", () => {
    expect(canReviewOvertimeEntries(TeamMemberRole.supervisor)).toBe(true);
    expect(canViewTeamOvertime(TeamMemberRole.supervisor)).toBe(true);
    expect(canManageOvertimePayroll(TeamMemberRole.supervisor)).toBe(false);
  });

  it("allows finance to manage cash and payroll without overtime approval authority", () => {
    expect(canManagePettyCashLedger(TeamMemberRole.finance)).toBe(true);
    expect(canViewPettyCashLedger(TeamMemberRole.finance)).toBe(true);
    expect(canManageOvertimePayroll(TeamMemberRole.finance)).toBe(true);
    expect(canReviewOvertimeEntries(TeamMemberRole.finance)).toBe(false);
  });

  it("keeps workers scoped to submission and personal overtime visibility", () => {
    expect(canViewTeamOvertime(TeamMemberRole.worker)).toBe(false);
    expect(canManagePettyCashLedger(TeamMemberRole.worker)).toBe(false);
    expect(canManageOvertimePayroll(TeamMemberRole.worker)).toBe(false);
    expect(canReviewOvertimeEntries(TeamMemberRole.worker)).toBe(false);
  });
});
