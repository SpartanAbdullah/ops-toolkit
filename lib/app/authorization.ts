import { TeamMemberRole } from "@prisma/client";

export type OperationalRole = TeamMemberRole | null | undefined;

const teamManagers = new Set<TeamMemberRole>([TeamMemberRole.owner, TeamMemberRole.admin]);
const overtimeReviewers = new Set<TeamMemberRole>([
  TeamMemberRole.owner,
  TeamMemberRole.admin,
  TeamMemberRole.supervisor,
]);
const payrollManagers = new Set<TeamMemberRole>([
  TeamMemberRole.owner,
  TeamMemberRole.admin,
  TeamMemberRole.finance,
]);
const pettyCashManagers = new Set<TeamMemberRole>([
  TeamMemberRole.owner,
  TeamMemberRole.admin,
  TeamMemberRole.finance,
]);
const financialViewers = new Set<TeamMemberRole>([
  TeamMemberRole.owner,
  TeamMemberRole.admin,
  TeamMemberRole.supervisor,
  TeamMemberRole.finance,
]);

function hasRole(role: OperationalRole, allowed: Set<TeamMemberRole>) {
  return Boolean(role && allowed.has(role));
}

export function isTeamMember(role: OperationalRole) {
  return Boolean(role);
}

export function canManageTeam(role: OperationalRole) {
  return hasRole(role, teamManagers);
}

export function canManageTeamInvites(role: OperationalRole) {
  return canManageTeam(role);
}

export function canManageOvertimeSettings(role: OperationalRole) {
  return hasRole(role, teamManagers);
}

export function canReviewOvertimeEntries(role: OperationalRole) {
  return hasRole(role, overtimeReviewers);
}

export function canViewTeamOvertime(role: OperationalRole) {
  return hasRole(role, new Set([...overtimeReviewers, TeamMemberRole.finance]));
}

export function canManageOvertimePayroll(role: OperationalRole) {
  return hasRole(role, payrollManagers);
}

export function canManagePettyCashLedger(role: OperationalRole) {
  return hasRole(role, pettyCashManagers);
}

export function canViewPettyCashLedger(role: OperationalRole) {
  return hasRole(role, financialViewers);
}

export function getMembershipRoleLabel(role: OperationalRole) {
  switch (role) {
    case TeamMemberRole.owner:
      return "Owner";
    case TeamMemberRole.admin:
      return "Admin";
    case TeamMemberRole.supervisor:
      return "Supervisor";
    case TeamMemberRole.finance:
      return "Finance";
    case TeamMemberRole.worker:
      return "Worker";
    default:
      return "No team role";
  }
}
