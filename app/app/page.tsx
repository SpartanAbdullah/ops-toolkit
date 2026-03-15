import Link from "next/link";
import { TeamMemberRole } from "@prisma/client";
import { Bell, CreditCard, FileBarChart2, PercentCircle, Users2, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { SummaryBlock } from "@/components/ui/summary-block";
import { getRoleBadgeVariant, getRoleLabel } from "@/lib/app/team";
import { getAppContext, getRecentActivity, getUnreadNotificationCount } from "@/lib/app/session";
import {
  buildOvertimeRows,
  calculateOvertimeSummary,
  formatOvertimeDate,
  getLatestPaymentMap,
  getTodayInputValue,
} from "@/lib/overtime";
import {
  buildRunningLedgerRows,
  calculatePettyCashSummary,
  formatPettyCashDate,
} from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Workspace Overview",
  description: "Open the private Ops Toolkit workspace overview for saved modules, team activity, notifications, and protected operational tools.",
  path: "/app",
  noIndex: true,
});

export default async function AppDashboardPage() {
  const context = await getAppContext();
  const activeTeamId = context.activeTeam?.id ?? null;
  const isAdmin = context.activeMembership?.role === TeamMemberRole.admin;

  const [activity, unreadNotifications, account, paymentRecords, entryRecords] = await Promise.all([
    getRecentActivity(5),
    getUnreadNotificationCount(),
    prisma.pettyCashAccount.findUnique({
      where: { userId: context.user.id },
      include: {
        transactions: {
          orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    activeTeamId
      ? prisma.overtimePaymentRecord.findMany({
          where: isAdmin ? { teamId: activeTeamId } : { teamId: activeTeamId, workerUserId: context.user.id },
          orderBy: { paidUntilDate: "desc" },
        })
      : Promise.resolve([]),
    prisma.overtimeEntry.findMany({
      where: activeTeamId
        ? (isAdmin ? { teamId: activeTeamId } : { teamId: activeTeamId, workerUserId: context.user.id })
        : { teamId: null, workerUserId: context.user.id },
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

  const roleLabel = getRoleLabel(context.resolvedRole);
  const roleVariant = getRoleBadgeVariant(context.resolvedRole);
  const today = getTodayInputValue();
  const pettyCashRows = account
    ? buildRunningLedgerRows(
        account.transactions.map((transaction) => ({
          id: transaction.id,
          occurredAt: transaction.occurredAt,
          createdAt: transaction.createdAt,
          type: transaction.type,
          amount: Number(transaction.amount),
          category: transaction.category,
          vendorPayee: transaction.vendorPayee,
          paymentMethod: transaction.paymentMethod,
          notes: transaction.notes,
          referenceNumber: transaction.referenceNumber,
          receiptReference: transaction.receiptReference,
          status: transaction.status,
          reimbursementStatus: transaction.reimbursementStatus,
        })),
      )
    : [];
  const pettyCashSummary = calculatePettyCashSummary(pettyCashRows);
  const latestPaymentMap = getLatestPaymentMap(paymentRecords);
  const overtimeRows = buildOvertimeRows(
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
  const overtimeSummary = calculateOvertimeSummary(overtimeRows);
  const todayEntriesCount = overtimeRows.filter((row) => row.workedOn === today).length;
  const hasOpeningBalance = pettyCashRows.some((row) => row.type === "opening_balance");
  const recentRows = overtimeRows.slice(0, 3);

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Dashboard"
        badge={context.activeTeam ? "Team workspace" : "Individual workspace"}
        title={`Good to see you, ${context.profile?.fullName || context.user.email}`}
        description="Keep today moving with the few numbers that matter, short action paths, and recent updates you can scan in a few seconds."
        actions={
          <>
            <Button asChild>
              <Link href="/app/overtime">Open OT</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/app/petty-cash">Open cash</Link>
            </Button>
          </>
        }
      />

      {!context.activeTeam ? (
        <Callout
          title="Set up your team before rollout"
          description="Create a workspace or join with a code so overtime approvals, saved records, and member visibility can run in one place."
          icon={Users2}
          tone="amber"
        >
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/app/team">Go to teams</Link>
            </Button>
          </div>
        </Callout>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's OT entries"
          value={todayEntriesCount}
          description="Entries logged for today in your current workspace view."
          icon={PercentCircle}
          tone="blue"
        />
        <StatCard
          label="Pending approvals"
          value={overtimeSummary.pendingCount}
          description={isAdmin ? "Items waiting for team review." : "Your submitted shifts still awaiting review."}
          icon={Bell}
          tone="amber"
        />
        <StatCard
          label="Petty cash balance"
          value={formatCurrency(pettyCashSummary.currentCashBalance)}
          description="Current cash on hand from the live ledger."
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="This month OT"
          value={formatCurrency(overtimeSummary.approvedAmountThisMonth)}
          description="Approved overtime value recorded this month."
          icon={CreditCard}
          tone="blue"
          accent={<Badge variant={roleVariant}>{roleLabel}</Badge>}
        />
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeader
            eyebrow="Quick actions"
            title="Move the next job forward"
            description="Keep the top paths obvious on mobile."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Button asChild className="justify-start">
              <Link href="/app/overtime">Log or review OT</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/app/petty-cash">{hasOpeningBalance ? "Add cash transaction" : "Set opening balance"}</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/app/team">Manage team</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/app/reports">Open reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="Today"
              title="Operational status"
              description="The short list of items most likely to need attention."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryBlock
                label="Unread alerts"
                value={unreadNotifications}
                hint="Notifications waiting in your workspace."
                tone={unreadNotifications ? "warning" : "default"}
              />
              <SummaryBlock
                label="Recent submissions"
                value={recentRows.length}
                hint="Latest overtime items in your current view."
                tone="primary"
              />
            </div>
            {recentRows.length ? (
              <div className="space-y-3">
                {recentRows.map((row) => (
                  <ListRow
                    key={row.id}
                    title={context.activeTeam && isAdmin ? row.workerName : formatOvertimeDate(row.workedOn)}
                    subtitle={context.activeTeam && isAdmin ? `${formatOvertimeDate(row.workedOn)} · ${row.totalWorkedLabel} worked · ${row.overtimeLabel} OT` : `${row.totalWorkedLabel} worked · ${row.overtimeLabel} OT`}
                    meta={row.approvedBy || "Awaiting review"}
                    badges={<Badge variant={row.statusVariant}>{row.statusLabel}</Badge>}
                    aside={<p className="text-sm font-semibold text-text-primary">{row.amountLabel}</p>}
                    details={row.notes || row.calculationSummary}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent overtime activity"
                description="Once shifts are logged, recent entries will appear here with status and payout visibility."
                action={
                  <Button asChild>
                    <Link href="/app/overtime">Open OT</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="Activity"
              title="Recent workspace activity"
              description="A short audit trail for the latest changes."
            />
            {activity.length ? (
              <div className="space-y-3">
                {activity.map((item) => (
                  <ListRow
                    key={item.id}
                    title={item.summary}
                    subtitle={item.actor?.profile?.fullName || item.actor?.email || "System"}
                    meta={item.createdAt.toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Creating a team, logging OT, or adding petty cash entries will start the activity trail."
              />
            )}
            {pettyCashRows.length ? (
              <div className="rounded-3xl border border-border bg-slate-50 p-4">
                <p className="section-label">Latest cash movement</p>
                <p className="mt-2 text-base font-semibold text-text-primary">{pettyCashRows.at(-1)?.typeLabel}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {pettyCashRows.at(-1) ? `${formatPettyCashDate(pettyCashRows.at(-1)!.occurredOn)} · ${pettyCashRows.at(-1)!.cashImpactLabel}` : "No cash movement yet"}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeader
            eyebrow="Reports"
            title="Need a wider view?"
            description="Use the reports area for monthly totals, ledger trends, and export-ready summaries."
            actions={
              <Button asChild variant="secondary">
                <Link href="/app/reports">
                  <FileBarChart2 className="h-4 w-4" />
                  Open reports
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
