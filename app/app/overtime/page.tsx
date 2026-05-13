import Link from "next/link";
import { TeamMemberRole } from "@prisma/client";
import { Bell, ClipboardCheck, Clock3, HandCoins, Settings2, Users, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { OvertimeCompensationSheet } from "@/components/app/overtime-compensation-sheet";
import { OvertimeEntryList } from "@/components/app/overtime-entry-list";
import { OvertimeEntrySheet } from "@/components/app/overtime-entry-sheet";
import { OvertimeExportButton } from "@/components/app/overtime-export-button";
import { OvertimeFilterBar } from "@/components/app/overtime-filter-bar";
import { OvertimePaymentSheet } from "@/components/app/overtime-payment-sheet";
import { OvertimePendingProvider } from "@/components/app/overtime-pending-provider";
import { OvertimePendingRows } from "@/components/app/overtime-pending-rows";
import { OvertimeSettingsForm } from "@/components/app/overtime-settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";
import {
  buildOvertimeRows,
  buildWorkerBreakdown,
  calculateOvertimeSummary,
  filterOvertimeRows,
  formatMinutesAsHours,
  formatOvertimeDate,
  getDefaultOvertimeSettingsSnapshot,
  getLatestPaymentMap,
  normalizeOvertimeFilters,
  type OvertimeSettingsSnapshot,
} from "@/lib/overtime";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";
import type { OvertimeSettingsValues } from "@/lib/validation/overtime";

export const metadata = buildMetadata({
  title: "Overtime",
});

export const dynamic = "force-dynamic";

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildSettingsFormValues(snapshot: OvertimeSettingsSnapshot): OvertimeSettingsValues {
  return {
    calculationMode: snapshot.calculationMode,
    standardDailyHours: snapshot.standardDailyHours.toString(),
    fixedHourlyRate: snapshot.simpleHourlyRate != null ? snapshot.simpleHourlyRate.toString() : "",
    weekendDays: snapshot.weekendDays,
    ramadanEnabled: snapshot.ramadanEnabled,
    ramadanStartDate: snapshot.ramadanStartDate ?? "",
    ramadanEndDate: snapshot.ramadanEndDate ?? "",
    individualBasicMonthlySalary: snapshot.individualBasicMonthlySalary != null ? snapshot.individualBasicMonthlySalary.toString() : "",
  };
}

export default async function OvertimePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getAppContext();
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTeamId = context.activeTeam?.id ?? null;
  const isAdmin = context.activeMembership?.role === TeamMemberRole.admin;
  const scope: "individual" | "team" = activeTeamId ? "team" : "individual";

  const requestedTab = getQueryValue(resolvedSearchParams.tab) ?? "entries";
  const tabs = [
    { value: "entries", label: "Entries" },
    ...(activeTeamId && isAdmin
      ? [
          { value: "approvals", label: "Approvals" },
          { value: "members", label: "Members" },
          { value: "payments", label: "Payments" },
        ]
      : []),
    { value: "settings", label: "Settings" },
  ];
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab : tabs[0]?.value ?? "entries";

  const filters = normalizeOvertimeFilters({
    range: getQueryValue(resolvedSearchParams.range) as Parameters<typeof normalizeOvertimeFilters>[0]["range"],
    from: getQueryValue(resolvedSearchParams.from),
    to: getQueryValue(resolvedSearchParams.to),
    status: getQueryValue(resolvedSearchParams.status) as Parameters<typeof normalizeOvertimeFilters>[0]["status"],
    workerId: getQueryValue(resolvedSearchParams.workerId),
  });

  const [settingsRecord, holidayRecords, memberRecords, workerProfiles, paymentRecords, entryRecords] = await Promise.all([
    activeTeamId
      ? prisma.overtimeSettings.findUnique({ where: { teamId: activeTeamId } })
      : prisma.overtimeSettings.findUnique({ where: { ownerUserId: context.user.id } }),
    activeTeamId ? prisma.overtimeHolidayDate.findMany({ where: { teamId: activeTeamId }, orderBy: { date: "asc" } }) : Promise.resolve([]),
    activeTeamId
      ? prisma.teamMember.findMany({
          where: { teamId: activeTeamId },
          include: { user: { include: { profile: true } } },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    activeTeamId ? prisma.overtimeWorkerProfile.findMany({ where: { teamId: activeTeamId } }) : Promise.resolve([]),
    activeTeamId
      ? prisma.overtimePaymentRecord.findMany({
          where: isAdmin ? { teamId: activeTeamId } : { teamId: activeTeamId, workerUserId: context.user.id },
          orderBy: { paidUntilDate: "desc" },
        })
      : Promise.resolve([]),
    prisma.overtimeEntry.findMany({
      where: activeTeamId
        ? isAdmin
          ? { teamId: activeTeamId }
          : { teamId: activeTeamId, workerUserId: context.user.id }
        : { teamId: null, workerUserId: context.user.id },
      include: {
        worker: { include: { profile: true } },
        approvals: { orderBy: { createdAt: "desc" }, take: 1, include: { approver: { include: { profile: true } } } },
      },
      orderBy: [{ workedDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const settingsSnapshot: OvertimeSettingsSnapshot = settingsRecord
    ? {
        scope,
        calculationMode: settingsRecord.calculationMode,
        standardDailyHours: Number(settingsRecord.standardDailyHours),
        simpleHourlyRate: settingsRecord.simpleHourlyRate ? Number(settingsRecord.simpleHourlyRate) : null,
        weekendDays: settingsRecord.weekendDays as OvertimeSettingsSnapshot["weekendDays"],
        ramadanEnabled: settingsRecord.ramadanEnabled,
        ramadanStartDate: settingsRecord.ramadanStartDate?.toISOString().slice(0, 10) ?? null,
        ramadanEndDate: settingsRecord.ramadanEndDate?.toISOString().slice(0, 10) ?? null,
        individualBasicMonthlySalary: settingsRecord.individualBasicMonthlySalary ? Number(settingsRecord.individualBasicMonthlySalary) : null,
      }
    : getDefaultOvertimeSettingsSnapshot(scope);

  const workerSalaryMap = new Map(
    workerProfiles.map((profile) => [profile.workerUserId, profile.basicMonthlySalary ? Number(profile.basicMonthlySalary) : null]),
  );
  const currentUserSalary = activeTeamId ? workerSalaryMap.get(context.user.id) ?? null : settingsSnapshot.individualBasicMonthlySalary;
  const latestPaymentMap = getLatestPaymentMap(paymentRecords);

  const rows = buildOvertimeRows(
    entryRecords.map((entry) => ({
      id: entry.id,
      workerUserId: entry.workerUserId,
      workerName: entry.worker.profile?.fullName || entry.worker.email,
      workedDate: entry.workedDate,
      startTimeMinutes: entry.startTimeMinutes,
      endTimeMinutes: entry.endTimeMinutes,
      overnight: entry.overnight,
      notes: entry.notes,
      calculationMode: entry.calculationMode,
      standardDailyHours: Number(entry.standardDailyHours),
      totalWorkedMinutes: entry.totalWorkedMinutes,
      overtimeMinutes: entry.overtimeMinutes,
      dayOvertimeMinutes: entry.dayOvertimeMinutes,
      nightOvertimeMinutes: entry.nightOvertimeMinutes,
      calculatedOvertimeAmount: Number(entry.calculatedOvertimeAmount),
      approvedWorkedMinutes: entry.approvedWorkedMinutes,
      approvedOvertimeMinutes: entry.approvedOvertimeMinutes,
      approvedOvertimeAmount: entry.approvedOvertimeAmount ? Number(entry.approvedOvertimeAmount) : null,
      fixedHourlyRate: entry.fixedHourlyRate ? Number(entry.fixedHourlyRate) : null,
      basicMonthlySalary: entry.basicMonthlySalary ? Number(entry.basicMonthlySalary) : null,
      isWeekend: entry.isWeekend,
      isHoliday: entry.isHoliday,
      wellbeingWarning: entry.wellbeingWarning,
      status: entry.status,
      latestApproval: entry.approvals[0]
        ? {
            approverName: entry.approvals[0].approver.profile?.fullName || entry.approvals[0].approver.email,
            comment: entry.approvals[0].comment,
            createdAt: entry.approvals[0].createdAt,
          }
        : null,
      lastDecisionAt: entry.lastDecisionAt,
    })),
    latestPaymentMap,
  );

  const filteredRows = filterOvertimeRows(rows, filters);
  const pendingRows = rows.filter((row) => row.status === "pending");
  const thisMonthRows = filterOvertimeRows(rows, normalizeOvertimeFilters({ range: "this_month", status: "all", workerId: "all" }));
  const summary = calculateOvertimeSummary(rows);
  const workerBreakdown = buildWorkerBreakdown(thisMonthRows);
  const allWorkerBreakdown = new Map(buildWorkerBreakdown(rows).map((item) => [item.workerUserId, item]));
  const hasSettings = Boolean(settingsRecord);
  const canCurrentUserCalculate =
    hasSettings && (settingsSnapshot.calculationMode === "simple" ? settingsSnapshot.simpleHourlyRate != null : currentUserSalary != null);
  const filtersActive = Boolean(
    filters.range !== "this_month" || filters.status !== "all" || filters.workerId !== "all",
  );
  const visibleRowsForExport = activeTab === "approvals" ? pendingRows : filteredRows;
  const roleLabel = getRoleLabel(context.resolvedRole);

  const memberRows = memberRecords.map((member) => {
    const breakdown = allWorkerBreakdown.get(member.userId);
    return {
      id: member.userId,
      name: member.user.profile?.fullName || member.user.email,
      email: member.user.email,
      role: member.role,
      salary: workerSalaryMap.get(member.userId) ?? null,
      lastPaidDate: latestPaymentMap[member.userId] ?? null,
      approvedHours: breakdown?.overtimeMinutes ?? 0,
      approvedAmount: breakdown?.amount ?? 0,
      pendingCount: breakdown?.pendingCount ?? 0,
    };
  });
  const missingSalaryMembers =
    settingsSnapshot.calculationMode === "mohre_compliant" ? memberRows.filter((member) => member.salary == null) : [];

  return (
    <OvertimePendingProvider>
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Overtime"
        badge={activeTeamId ? `${roleLabel}` : "Personal"}
        title="Overtime"
        description={
          activeTeamId
            ? isAdmin
              ? "Capture shifts, approve, and track payments for the team."
              : "Log your shifts and see approval and payment status."
            : "Track your own overtime with calculation history."
        }
        actions={
          hasSettings && canCurrentUserCalculate ? (
            <OvertimeEntrySheet
              buttonLabel="Log shift"
              buttonIcon
              settings={settingsSnapshot}
              holidayDates={holidayRecords.map((holiday) => holiday.date.toISOString().slice(0, 10))}
              workerSalary={currentUserSalary}
              approvalLabel={activeTeamId && !isAdmin ? "Saves as pending for admin review." : "Saves and auto-approves in your workspace."}
            />
          ) : (
            <Button asChild>
              <Link href="/app/overtime?tab=settings">Set up overtime</Link>
            </Button>
          )
        }
      />

      {/* Spotlight hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-700 bg-primary-700 text-white shadow-elevated">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.35), transparent 60%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r from-accent-500 via-accent-500 to-transparent sm:inset-x-7" />

        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-2xs uppercase tracking-[0.18em] text-accent-500">This month overtime</p>
          <p className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-[52px]">
            {formatCurrency(summary.approvedAmountThisMonth)}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <Clock3 className="h-4 w-4 text-accent-500" />
              <span className="font-semibold tabular-nums">{formatMinutesAsHours(summary.approvedHoursThisMonth)}</span>
              <span className="text-2xs uppercase tracking-wide text-white/60">approved hrs</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <Bell className="h-4 w-4 text-accent-500" />
              <span className="font-semibold tabular-nums">{summary.pendingCount}</span>
              <span className="text-2xs uppercase tracking-wide text-white/60">pending</span>
            </span>
            {activeTeamId && isAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-white/90">
                <HandCoins className="h-4 w-4 text-accent-500" />
                <span className="font-semibold tabular-nums">{summary.unpaidApprovedCount}</span>
                <span className="text-2xs uppercase tracking-wide text-white/60">unpaid</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <ClipboardCheck className="h-4 w-4 text-accent-500" />
              <span className="font-semibold tabular-nums">{summary.approvedEntryCountThisMonth}</span>
              <span className="text-2xs uppercase tracking-wide text-white/60">entries</span>
            </span>
          </div>
        </div>
      </div>

      {!hasSettings ? (
        <Callout
          title="Set up overtime first"
          description="Save the policy settings before logging any shifts."
          icon={Settings2}
          tone="amber"
        >
          <Button asChild variant="accent" size="sm">
            <Link href="/app/overtime?tab=settings">Open settings</Link>
          </Button>
        </Callout>
      ) : null}

      {hasSettings && settingsSnapshot.calculationMode === "mohre_compliant" && currentUserSalary == null ? (
        <Callout
          title={activeTeamId ? (isAdmin ? "Add your salary profile" : "Salary needed for compliant mode") : "Add your basic salary"}
          description={
            activeTeamId
              ? isAdmin
                ? "Set your own worker compensation in Members."
                : "Ask an admin to add your basic monthly salary."
              : "Compliant mode needs your basic monthly salary."
          }
          icon={Wallet}
          tone="amber"
        />
      ) : null}

      {/* Tab switcher */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-2xl border border-border bg-white p-1 shadow-card">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/app/overtime?tab=${tab.value}`}
              className={cn(
                "tap-highlight rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                activeTab === tab.value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "entries" ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{filteredRows.length}</span> entries shown
            </p>
            <OvertimeExportButton rows={visibleRowsForExport} />
          </div>
          <OvertimeFilterBar
            filters={filters}
            workers={isAdmin ? memberRows.map((member) => ({ id: member.id, name: member.name })) : []}
            tab="entries"
          />
          <OvertimePendingRows />
          <OvertimeEntryList
            rows={filteredRows}
            hasAnyRows={rows.length > 0}
            filtersActive={filtersActive}
            showWorkerName={Boolean(activeTeamId && isAdmin)}
            showAdminActions={false}
            emptyTitle="No entries match these filters"
            emptyDescription="Adjust the filters to see more results."
            resetHref="/app/overtime?tab=entries"
          />
        </>
      ) : null}

      {activeTab === "approvals" && activeTeamId && isAdmin ? (
        <>
          {pendingRows.length ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{pendingRows.length}</span> awaiting review
              </p>
              <OvertimeExportButton rows={pendingRows} />
            </div>
          ) : (
            <Callout
              title="Queue is clear"
              description="No pending entries right now. New submissions will appear here."
              icon={ClipboardCheck}
              tone="mint"
            />
          )}
          <OvertimePendingRows />
          <OvertimeEntryList
            rows={pendingRows}
            hasAnyRows={rows.length > 0}
            filtersActive={false}
            showWorkerName
            showAdminActions
            emptyTitle="No pending approvals"
            emptyDescription="Submissions will appear here when waiting for review."
          />
        </>
      ) : null}

      {activeTab === "settings" ? (
        <OvertimeSettingsForm
          scope={scope}
          initialValues={buildSettingsFormValues(settingsSnapshot)}
          holidays={holidayRecords.map((holiday) => ({
            id: holiday.id,
            date: holiday.date.toISOString().slice(0, 10),
            label: holiday.label,
          }))}
          canManageHolidays={Boolean(activeTeamId && isAdmin)}
        />
      ) : null}

      {activeTab === "members" && activeTeamId && isAdmin ? (
        <div className="space-y-4">
          {missingSalaryMembers.length ? (
            <Callout
              title="Missing salary profiles"
              description={`${missingSalaryMembers.length} member${missingSalaryMembers.length === 1 ? "" : "s"} need a salary for compliant mode.`}
              icon={Users}
              tone="amber"
            />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {memberRows.map((member) => (
              <Card key={member.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-text-primary">{member.name}</p>
                      <p className="mt-0.5 truncate text-2xs text-text-muted">{member.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-surface-muted px-3 py-2">
                      <p className="text-2xs uppercase tracking-wide text-text-muted">Salary</p>
                      <p className="mt-0.5 font-display text-sm font-semibold text-text-primary">
                        {member.salary ? formatCurrency(member.salary) : "Not set"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-muted px-3 py-2">
                      <p className="text-2xs uppercase tracking-wide text-text-muted">Approved OT</p>
                      <p className="mt-0.5 font-display text-sm font-semibold text-text-primary">
                        {formatMinutesAsHours(member.approvedHours)}
                      </p>
                      <p className="text-2xs text-text-muted">{formatCurrency(member.approvedAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-text-muted">
                    <span>{member.lastPaidDate ? `Paid through ${formatOvertimeDate(member.lastPaidDate)}` : "No payment recorded"}</span>
                    <span>{member.pendingCount} pending</span>
                  </div>
                  <OvertimeCompensationSheet
                    workerUserId={member.id}
                    workerName={member.name}
                    currentSalary={member.salary}
                    buttonLabel="Set salary"
                    buttonVariant="secondary"
                    buttonSize="sm"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          {!memberRows.length ? (
            <Callout
              title="No team members yet"
              description="Share your join code from the Team page to add members."
              icon={Users}
              tone="navy"
            />
          ) : null}
        </div>
      ) : null}

      {activeTab !== "entries" && activeTab !== "approvals" ? <OvertimePendingRows /> : null}

      {activeTab === "payments" && activeTeamId && isAdmin ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-text-primary">Mark overtime paid</p>
                  <p className="mt-1 text-sm leading-5 text-text-secondary">
                    Record the paid-through date so workers see when their OT is paid.
                  </p>
                </div>
              </div>
              <OvertimePaymentSheet
                workers={memberRows.map((member) => ({ id: member.id, name: member.name }))}
                buttonLabel="Mark paid"
                buttonVariant="default"
              />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="section-label px-1">Worker payment status</p>
            {memberRows.map((member) => (
              <div key={member.id} className="rounded-2xl border border-border bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-text-primary">{member.name}</p>
                    <p className="mt-0.5 text-2xs text-text-muted">
                      {member.lastPaidDate ? `Paid through ${formatOvertimeDate(member.lastPaidDate)}` : "Not recorded"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-semibold tabular-nums text-text-primary">
                      {formatCurrency(member.approvedAmount)}
                    </p>
                    <p className="text-2xs text-text-muted">{member.pendingCount} pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {workerBreakdown.length ? (
            <div className="space-y-2">
              <p className="section-label px-1">Per-worker this month</p>
              {workerBreakdown.map((worker) => (
                <div key={worker.workerUserId} className="rounded-2xl border border-border bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-semibold text-text-primary">{worker.workerName}</p>
                      <p className="mt-0.5 text-2xs text-text-muted">{formatMinutesAsHours(worker.overtimeMinutes)} approved</p>
                    </div>
                    <p className="font-display text-sm font-semibold tabular-nums text-text-primary">{formatCurrency(worker.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
    </OvertimePendingProvider>
  );
}
