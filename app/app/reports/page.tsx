import Link from "next/link";
import { TeamMemberRole } from "@prisma/client";
import { CalendarRange, CreditCard, Download, FileBarChart2, PercentCircle, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { OvertimeExportButton } from "@/components/app/overtime-export-button";
import { PettyCashExportButton } from "@/components/app/petty-cash-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { getAppContext } from "@/lib/app/session";
import {
  buildOvertimeRows,
  calculateOvertimeSummary,
  formatOvertimeDate,
  getLatestPaymentMap,
} from "@/lib/overtime";
import {
  buildRunningLedgerRows,
  calculatePettyCashSummary,
  formatPettyCashDate,
  type PettyCashLedgerRow,
} from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Reports",
  description: "Review clean operational summaries, trends, and exports for overtime and petty cash.",
  path: "/app/reports",
  noIndex: true,
});

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRangeDays(value: string | undefined) {
  return value === "90" ? 90 : 30;
}

function getRangeStart(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - (days - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function buildMonthTrend(entries: Array<{ date: string; value: number }>, months = 4) {
  const now = new Date();
  const labels = Array.from({ length: months }).map((_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - index - 1), 1));
    return {
      key: `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, "0")}`,
      label: date.toLocaleString("en-AE", { month: "short" }),
    };
  });

  return labels.map((label) => ({
    ...label,
    value: entries
      .filter((entry) => entry.date.startsWith(label.key))
      .reduce((total, entry) => total + entry.value, 0),
  }));
}

function getBarWidth(value: number, maxValue: number) {
  if (!maxValue || value <= 0) {
    return "8%";
  }

  return `${Math.max((value / maxValue) * 100, 8)}%`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getAppContext();
  const activeTeamId = context.activeTeam?.id ?? null;
  const isAdmin = context.activeMembership?.role === TeamMemberRole.admin;
  const resolvedSearchParams = (await searchParams) ?? {};
  const rangeDays = getRangeDays(getQueryValue(resolvedSearchParams.range));
  const rangeStart = getRangeStart(rangeDays);

  const [account, paymentRecords, entryRecords] = await Promise.all([
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
  const rangeStartInput = rangeStart.toISOString().slice(0, 10);
  const pettyCashRangeRows = pettyCashRows.filter((row) => row.occurredOn >= rangeStartInput);
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
  const overtimeRangeRows = overtimeRows.filter((row) => row.workedOn >= rangeStartInput);
  const overtimeTrend = buildMonthTrend(
    overtimeRangeRows
      .filter((row) => row.status === "approved" || row.status === "auto_approved")
      .map((row) => ({ date: row.workedOn, value: row.amount })),
  );
  const pettyCashTrend = buildMonthTrend(
    pettyCashRangeRows
      .filter((row) => row.type === "expense_cash" || row.type === "expense_card")
      .map((row) => ({ date: row.occurredOn, value: row.amount })),
  );
  const maxOvertimeTrend = Math.max(...overtimeTrend.map((item) => item.value), 0);
  const maxPettyCashTrend = Math.max(...pettyCashTrend.map((item) => item.value), 0);
  const recentCashRows = pettyCashRangeRows.slice(-3).reverse();
  const recentOvertimeRows = overtimeRangeRows.slice(0, 3);

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Reports"
        badge={`${rangeDays} day view`}
        title="Simple reporting for operational follow-up"
        description="Review the core numbers, scan recent movement, and export what you need without opening a dense analytics dashboard."
        actions={
          <>
            <OvertimeExportButton rows={overtimeRangeRows} />
            <PettyCashExportButton rows={pettyCashRangeRows} />
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <SectionHeader
            eyebrow="Range"
            title="Choose a report window"
            description="Switch between short operational views without reloading into a complex filter screen."
          />
          <div className="flex flex-wrap gap-3">
            {[30, 90].map((days) => (
              <Button key={days} asChild variant={rangeDays === days ? "default" : "secondary"}>
                <Link href={`/app/reports?range=${days}`}>
                  <CalendarRange className="h-4 w-4" />
                  Last {days} days
                </Link>
              </Button>
            ))}
            <Button asChild variant="outline">
              <Link href="/app/overtime">
                <Download className="h-4 w-4" />
                OT workspace
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approved OT in range"
          value={formatCurrency(overtimeRangeRows.filter((row) => row.status === "approved" || row.status === "auto_approved").reduce((total, row) => total + row.amount, 0))}
          description="Approved overtime value inside the current report window."
          icon={PercentCircle}
          tone="blue"
        />
        <StatCard
          label="Pending OT items"
          value={overtimeRangeRows.filter((row) => row.status === "pending").length}
          description="Unresolved OT entries still waiting in this range."
          icon={FileBarChart2}
          tone="amber"
        />
        <StatCard
          label="Current cash balance"
          value={formatCurrency(pettyCashSummary.currentCashBalance)}
          description="Live petty cash balance from the running ledger."
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="Expenses in range"
          value={formatCurrency(pettyCashRangeRows.filter((row) => row.type === "expense_cash" || row.type === "expense_card").reduce((total, row) => total + row.amount, 0))}
          description="Cash and card expenses recorded inside this report window."
          icon={CreditCard}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="Trend"
              title="Overtime value trend"
              description="Approved OT value by month."
              badge={`${overtimeSummary.approvedEntryCountThisMonth} approved this month`}
            />
            {overtimeTrend.some((item) => item.value > 0) ? (
              <div className="space-y-3">
                {overtimeTrend.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-text-primary">{item.label}</span>
                      <span className="text-text-secondary">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-primary-600"
                        style={{ width: getBarWidth(item.value, maxOvertimeTrend) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No overtime trend yet"
                description="Approved OT will appear here once shifts move through review."
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
              eyebrow="Trend"
              title="Expense trend"
              description="Expense activity from petty cash by month."
              badge={`${pettyCashRangeRows.length} cash rows in range`}
            />
            {pettyCashTrend.some((item) => item.value > 0) ? (
              <div className="space-y-3">
                {pettyCashTrend.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-text-primary">{item.label}</span>
                      <span className="text-text-secondary">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-success-600"
                        style={{ width: getBarWidth(item.value, maxPettyCashTrend) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No expense trend yet"
                description="Cash expenses will appear here once transactions are recorded."
                action={
                  <Button asChild variant="secondary">
                    <Link href="/app/petty-cash">Open petty cash</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="Recent OT"
              title="Latest overtime items"
              description="Short list of OT movement inside the selected range."
            />
            {recentOvertimeRows.length ? (
              <div className="space-y-3">
                {recentOvertimeRows.map((row) => (
                  <ListRow
                    key={row.id}
                    title={context.activeTeam && isAdmin ? row.workerName : formatOvertimeDate(row.workedOn)}
                    subtitle={context.activeTeam && isAdmin ? `${formatOvertimeDate(row.workedOn)} · ${row.overtimeLabel}` : row.calculationSummary}
                    badges={<Badge variant={row.statusVariant}>{row.statusLabel}</Badge>}
                    aside={<p className="text-sm font-semibold text-text-primary">{row.amountLabel}</p>}
                    details={row.paymentStatusLabel}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No OT rows in this range" description="Try the longer date window or log new shifts." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="Recent cash"
              title="Latest petty cash movement"
              description="Recent ledger entries for fast checking."
            />
            {recentCashRows.length ? (
              <div className="space-y-3">
                {recentCashRows.map((row: PettyCashLedgerRow) => (
                  <ListRow
                    key={row.id}
                    title={row.typeLabel}
                    subtitle={`${formatPettyCashDate(row.occurredOn)} · ${row.category}`}
                    badges={<Badge variant={row.cashImpact < 0 ? "red" : row.cashImpact > 0 ? "green" : "subtle"}>{row.statusLabel}</Badge>}
                    aside={<p className="text-sm font-semibold text-text-primary">{row.cashImpactLabel}</p>}
                    details={row.notes || row.vendorPayee || "No extra note"}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No petty cash rows in this range" description="Add transactions to build a usable report trail." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
