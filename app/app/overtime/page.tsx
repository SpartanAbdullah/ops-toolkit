import Link from "next/link";
import { TeamMemberRole } from "@prisma/client";
import { Bell, CircleDollarSign, ClipboardCheck, Clock3, HandCoins, Settings2, Users2, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { OvertimeCompensationSheet } from "@/components/app/overtime-compensation-sheet";
import { OvertimeEntryList } from "@/components/app/overtime-entry-list";
import { OvertimeEntrySheet } from "@/components/app/overtime-entry-sheet";
import { OvertimeExportButton } from "@/components/app/overtime-export-button";
import { OvertimeFilterBar } from "@/components/app/overtime-filter-bar";
import { OvertimePaymentSheet } from "@/components/app/overtime-payment-sheet";
import { OvertimeSettingsForm } from "@/components/app/overtime-settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
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
  title: "Overtime Management",
  description: "Track shifts, approvals, payment status, and team overtime rules inside the authenticated Ops Toolkit workspace.",
  path: "/app/overtime",
  noIndex: true,
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
  const scope = activeTeamId ? "team" : "individual";

  const requestedTab = getQueryValue(resolvedSearchParams.tab) ?? "overview";
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "entries", label: "Entries" },
    ...(activeTeamId && isAdmin ? [{ value: "approvals", label: "Approvals" }, { value: "settings", label: "Settings" }, { value: "members", label: "Members" }, { value: "payments", label: "Payments" }] : []),
    ...(!activeTeamId ? [{ value: "settings", label: "Settings" }] : []),
  ];
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab : tabs[0]?.value ?? "overview";

  const filters = normalizeOvertimeFilters({
    range: getQueryValue(resolvedSearchParams.range) as Parameters<typeof normalizeOvertimeFilters>[0]["range"],
    from: getQueryValue(resolvedSearchParams.from),
    to: getQueryValue(resolvedSearchParams.to),
    status: getQueryValue(resolvedSearchParams.status) as Parameters<typeof normalizeOvertimeFilters>[0]["status"],
    workerId: getQueryValue(resolvedSearchParams.workerId),
  });

  const [settingsRecord, holidayRecords, memberRecords, workerProfiles, paymentRecords, notifications, entryRecords] = await Promise.all([
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
      ? prisma.overtimePaymentRecord.findMany({ where: isAdmin ? { teamId: activeTeamId } : { teamId: activeTeamId, workerUserId: context.user.id }, orderBy: { paidUntilDate: "desc" } })
      : Promise.resolve([]),
    prisma.notification.findMany({ where: { userId: context.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.overtimeEntry.findMany({
      where: activeTeamId ? (isAdmin ? { teamId: activeTeamId } : { teamId: activeTeamId, workerUserId: context.user.id }) : { teamId: null, workerUserId: context.user.id },
      include: {
        worker: { include: { profile: true } },
        approvals: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { approver: { include: { profile: true } } },
        },
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

  const workerSalaryMap = new Map(workerProfiles.map((profile) => [profile.workerUserId, profile.basicMonthlySalary ? Number(profile.basicMonthlySalary) : null]));
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
  const overtimeNotifications = notifications.filter((notification) => {
    const data = notification.data as { module?: string } | null;
    return data?.module === "overtime" || notification.title.toLowerCase().includes("overtime");
  });
  const hasSettings = Boolean(settingsRecord);
  const canCurrentUserCalculate = hasSettings && (settingsSnapshot.calculationMode === "simple" ? settingsSnapshot.simpleHourlyRate != null : currentUserSalary != null);
  const filtersActive = Boolean(filters.range !== "this_month" || filters.status !== "all" || filters.workerId !== "all");
  const visibleRowsForExport = activeTab === "approvals" ? pendingRows : filteredRows;
  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);
  const currentUserLastPaidDate = latestPaymentMap[context.user.id] ?? null;
  const currentUserApprovedRows = rows.filter((row) => row.status === "approved" || row.status === "auto_approved");
  const currentUserPaymentText = !activeTeamId ? "Payment tracking starts when you use the team workflow." : currentUserLastPaidDate ? `Paid through ${formatOvertimeDate(currentUserLastPaidDate)}` : currentUserApprovedRows.length ? "No payment record yet" : "No approved overtime yet";
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
  const missingSalaryMembers = settingsSnapshot.calculationMode === "mohre_compliant" ? memberRows.filter((member) => member.salary == null) : [];
  return (
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Overtime"
        badge={activeTeamId ? `${roleLabel} workspace` : "Individual workspace"}
        title="Overtime management built for real UAE operations"
        description={activeTeamId ? (isAdmin ? "Run shift capture, approvals, payment visibility, and team overtime settings from one clear workspace instead of juggling spreadsheets and WhatsApp messages." : "Log shifts quickly, see approval status, and understand exactly how your overtime hours and AED totals are being tracked.") : "Track your own overtime in a clean private workspace with saved history, calculation settings, and auto-approved entries."}
        actions={
          <div className="flex flex-wrap gap-3">
            {hasSettings && canCurrentUserCalculate ? (
              <OvertimeEntrySheet
                buttonLabel="Log shift"
                settings={settingsSnapshot}
                holidayDates={holidayRecords.map((holiday) => holiday.date.toISOString().slice(0, 10))}
                workerSalary={currentUserSalary}
                approvalLabel={activeTeamId && !isAdmin ? "Saved as pending for admin review" : "Saved and auto-approved in your workspace"}
              />
            ) : null}
            {(activeTab === "entries" || activeTab === "approvals") ? <OvertimeExportButton rows={visibleRowsForExport} /> : null}
            {!hasSettings ? (
              <Button asChild variant="secondary">
                <Link href="/app/overtime?tab=settings">Set up overtime</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="rounded-[1.7rem] border border-white/85 bg-white/88 p-3 shadow-card backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/app/overtime?tab=${tab.value}`}
              className={cn(
                "rounded-[1.1rem] px-4 py-2.5 text-sm font-semibold transition",
                activeTab === tab.value ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {!hasSettings ? (
        <Callout title="Overtime settings still need to be saved" description="The module can only calculate and store shifts once the overtime policy settings are saved. Use the Settings tab to finish the initial setup." icon={Settings2} tone="amber" />
      ) : null}

      {hasSettings && settingsSnapshot.calculationMode === "mohre_compliant" && currentUserSalary == null ? (
        <Callout
          title={activeTeamId ? (isAdmin ? "Your salary profile still needs to be added" : "Your admin needs to add your salary profile") : "Your basic salary is required for compliant mode"}
          description={activeTeamId ? (isAdmin ? "Set your own worker compensation profile in Members before logging compliant overtime for yourself." : "MOHRE-compliant calculations use the worker basic salary. Ask an admin to add yours in the Members tab.") : "Add your basic monthly salary in Settings so the compliant overtime calculation can produce AED totals."}
          icon={Wallet}
          tone="amber"
        />
      ) : null}

      {activeTab === "overview" ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Pending Entries</CardTitle>
                  <IconTile icon={ClipboardCheck} tone="amber" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{summary.pendingCount}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{activeTeamId && isAdmin ? "Entries waiting in the team approval queue." : "Your saved shifts that still need approval."}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">This Month OT Hours</CardTitle>
                  <IconTile icon={Clock3} tone="blue" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatMinutesAsHours(summary.approvedHoursThisMonth)}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Approved overtime hours recorded during the current month.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">This Month OT AED</CardTitle>
                  <IconTile icon={CircleDollarSign} tone="green" size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(summary.approvedAmountThisMonth)}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Approved overtime value captured for the current month.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{activeTeamId && isAdmin ? "Awaiting Payment" : "Payment Status"}</CardTitle>
                  <IconTile icon={activeTeamId && isAdmin ? HandCoins : Wallet} tone={activeTeamId && isAdmin ? "purple" : "blue"} size="sm" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{activeTeamId && isAdmin ? summary.unpaidApprovedCount : currentUserPaymentText}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{activeTeamId && isAdmin ? "Approved entries without a recorded paid-through date yet." : "Workers can always see the latest payment checkpoint for their own approved overtime."}</p>
              </CardContent>
            </Card>
          </div>

          {activeTeamId && isAdmin && pendingRows.length ? (
            <Callout title="The approval queue needs attention" description={`${pendingRows.length} shift ${pendingRows.length === 1 ? "is" : "are"} waiting for review right now.`} icon={ClipboardCheck} tone="blue">
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/app/overtime?tab=approvals">Open approval queue</Link>
                </Button>
              </div>
            </Callout>
          ) : null}

          {activeTeamId && isAdmin && missingSalaryMembers.length ? (
            <Callout title="Some team members still need salary profiles" description={`${missingSalaryMembers.length} member ${missingSalaryMembers.length === 1 ? "is" : "are"} missing the basic salary needed for MOHRE-compliant calculations.`} icon={Users2} tone="amber">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href="/app/overtime?tab=members">Open members</Link>
                </Button>
              </div>
            </Callout>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{activeTeamId && isAdmin ? "Per-worker breakdown" : "Recent overtime entries"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTeamId && isAdmin ? (
                  workerBreakdown.length ? workerBreakdown.map((worker) => (
                    <div key={worker.workerUserId} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{worker.workerName}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatMinutesAsHours(worker.overtimeMinutes)} approved this month</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/90 bg-white px-4 py-3 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(worker.amount)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{worker.pendingCount} pending</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm leading-7 text-slate-600">No approved overtime has been recorded this month yet.</div>
                ) : (
                  rows.slice(0, 5).length ? rows.slice(0, 5).map((row) => (
                    <div key={row.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{formatOvertimeDate(row.workedOn)}</p>
                          <p className="mt-1 text-sm text-slate-500">{row.totalWorkedLabel} worked, {row.overtimeLabel} OT</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                          <p className="text-sm font-semibold text-slate-900">{row.amountLabel}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm leading-7 text-slate-600">No overtime entries have been saved yet.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overtimeNotifications.length ? overtimeNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <IconTile icon={Bell} tone={notification.type === "warning" ? "amber" : notification.type === "success" ? "green" : "blue"} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-950">{notification.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{notification.createdAt.toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                    </div>
                  </div>
                )) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm leading-7 text-slate-600">Overtime approvals, rejections, and payment updates will appear here.</div>}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {activeTab === "entries" ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <OvertimeFilterBar filters={filters} workers={isAdmin ? memberRows.map((member) => ({ id: member.id, name: member.name })) : []} tab="entries" />
            <Card>
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-2xl">Visible totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Approved OT hours</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{formatMinutesAsHours(filteredRows.filter((row) => row.status === "approved" || row.status === "auto_approved").reduce((total, row) => total + row.overtimeMinutes, 0))}</p>
                </div>
                <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Approved OT AED</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{formatCurrency(filteredRows.filter((row) => row.status === "approved" || row.status === "auto_approved").reduce((total, row) => total + row.amount, 0))}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <OvertimeEntryList rows={filteredRows} hasAnyRows={rows.length > 0} filtersActive={filtersActive} showWorkerName={Boolean(activeTeamId && isAdmin)} showAdminActions={false} emptyTitle="No entries match these filters" emptyDescription="Adjust the filter range or reset the filters to bring back the full entry history." />
        </div>
      ) : null}
      {activeTab === "approvals" && activeTeamId && isAdmin ? (
        <div className="space-y-6">
          {!pendingRows.length ? <Callout title="The approval queue is clear" description="No pending entries are waiting for review right now. New worker submissions will appear here automatically." icon={ClipboardCheck} tone="green" /> : null}
          <OvertimeEntryList rows={pendingRows} hasAnyRows={rows.length > 0} filtersActive={false} showWorkerName showAdminActions emptyTitle="No pending approvals right now" emptyDescription="New worker submissions will appear here when they are waiting for review." />
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <OvertimeSettingsForm
          scope={scope}
          initialValues={buildSettingsFormValues(settingsSnapshot)}
          holidays={holidayRecords.map((holiday) => ({ id: holiday.id, date: holiday.date.toISOString().slice(0, 10), label: holiday.label }))}
          canManageHolidays={Boolean(activeTeamId && isAdmin)}
        />
      ) : null}

      {activeTab === "members" && activeTeamId && isAdmin ? (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {memberRows.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <p className="mt-2 text-sm text-slate-500">{member.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Basic salary</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{member.salary ? formatCurrency(member.salary) : "Not set"}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Approved OT</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{formatMinutesAsHours(member.approvedHours)}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatCurrency(member.approvedAmount)}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payment</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{member.lastPaidDate ? formatOvertimeDate(member.lastPaidDate) : "Not recorded"}</p>
                      <p className="mt-1 text-xs text-slate-500">{member.pendingCount} pending</p>
                    </div>
                  </div>
                  <OvertimeCompensationSheet workerUserId={member.id} workerName={member.name} currentSalary={member.salary} buttonLabel="Set salary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "payments" && activeTeamId && isAdmin ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Payment updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">Mark a worker paid through a specific date so approved overtime entries up to that checkpoint clearly show as paid in both admin and worker views.</p>
                <OvertimePaymentSheet workers={memberRows.map((member) => ({ id: member.id, name: member.name }))} buttonLabel="Mark paid through date" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Worker payment status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {memberRows.map((member) => (
                  <div key={member.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">{member.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{member.lastPaidDate ? `Paid through ${formatOvertimeDate(member.lastPaidDate)}` : "No paid-through date recorded yet"}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-white/90 bg-white px-4 py-3 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(member.approvedAmount)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{member.pendingCount} pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}