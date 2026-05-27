import Link from "next/link";
import { BarChart3, Clock3, Download, ReceiptText, ShieldCheck, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { canViewPettyCashLedger, canViewTeamOvertime } from "@/lib/app/authorization";
import { getAppContext } from "@/lib/app/session";
import { buildRunningLedgerRows, calculatePettyCashSummary } from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";
import { getZonedMonthBounds } from "@/lib/tz";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({ title: "Reports" });
export const dynamic = "force-dynamic";

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function ReportsPage() {
  const context = await getAppContext();
  const timezone = context.profile?.timezone || "Asia/Dubai";
  const canViewCash = canViewPettyCashLedger(context.activeMembership?.role);
  const canViewAllOvertime = canViewTeamOvertime(context.activeMembership?.role);

  if (!context.activeTeam) {
    return (
      <div className="space-y-5 animate-fade-up">
        <AppPageHeader
          eyebrow="Reports"
          badge="Workspace required"
          title="Reports"
          description="Reports are available after you create or join a workspace."
        />
        <Callout
          title="No workspace yet"
          description="Create or join a workspace before viewing petty cash or overtime reports."
          icon={ShieldCheck}
          tone="amber"
        >
          <Button asChild variant="accent" size="sm">
            <Link href="/app">Open Home</Link>
          </Button>
        </Callout>
      </div>
    );
  }

  const monthBounds = getZonedMonthBounds(new Date(), timezone);
  const [cashLedger, overtimeEntries] = await Promise.all([
    canViewCash
      ? prisma.cashLedger.findFirst({
          where: { teamId: context.activeTeam.id },
          select: {
            closings: {
              select: {
                id: true,
                periodMonth: true,
              },
              orderBy: { periodMonth: "desc" },
              take: 3,
            },
            transactions: {
              select: {
                id: true,
                occurredAt: true,
                createdAt: true,
                type: true,
                amount: true,
                category: true,
                vendorPayee: true,
                paymentMethod: true,
                notes: true,
                referenceNumber: true,
                receiptReference: true,
                status: true,
                reimbursementStatus: true,
                voidedAt: true,
                voidedReason: true,
              },
              orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
            },
          },
        })
      : Promise.resolve(null),
    prisma.overtimeEntry.findMany({
      where: canViewAllOvertime
        ? { teamId: context.activeTeam.id }
        : { teamId: context.activeTeam.id, workerUserId: context.user.id },
      select: {
        workedDate: true,
        status: true,
        overtimeMinutes: true,
        dayOvertimeMinutes: true,
        nightOvertimeMinutes: true,
        calculatedOvertimeAmount: true,
        approvedOvertimeAmount: true,
        isWeekend: true,
        isHoliday: true,
      },
      orderBy: [{ workedDate: "desc" }],
      take: 500,
    }),
  ]);

  const cashRows = cashLedger
    ? buildRunningLedgerRows(
        cashLedger.transactions.map((transaction) => ({
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
          voidedAt: transaction.voidedAt,
          voidedReason: transaction.voidedReason,
        })),
      )
    : [];
  const cashSummary = calculatePettyCashSummary(cashRows, timezone);
  const activeCashRows = cashRows.filter((row) => !row.voided);
  const categoryTotals = Array.from(
    activeCashRows
      .filter((row) => row.type === "expense_cash" || row.type === "expense_card")
      .reduce<Map<string, number>>((map, row) => {
        map.set(row.category, (map.get(row.category) ?? 0) + row.amount);
        return map;
      }, new Map())
      .entries(),
  ).sort((left, right) => right[1] - left[1]).slice(0, 5);

  const approvedThisMonth = overtimeEntries.filter((entry) => {
    const key = dateKey(entry.workedDate);
    return (
      (entry.status === "approved" || entry.status === "auto_approved")
      && key >= monthBounds.from
      && key <= monthBounds.to
    );
  });
  const pendingOvertimeCount = overtimeEntries.filter((entry) => entry.status === "pending").length;
  const overtimeAmount = approvedThisMonth.reduce(
    (total, entry) => total + Number(entry.approvedOvertimeAmount ?? entry.calculatedOvertimeAmount),
    0,
  );
  const dayOt = approvedThisMonth.reduce((total, entry) => total + entry.dayOvertimeMinutes, 0);
  const nightOt = approvedThisMonth.reduce((total, entry) => total + entry.nightOvertimeMinutes, 0);
  const weekendHolidayOt = approvedThisMonth.reduce(
    (total, entry) => total + (entry.isWeekend || entry.isHoliday ? entry.overtimeMinutes : 0),
    0,
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Reports"
        badge={context.activeTeam.name}
        title="Reports"
        description="Mobile summaries for petty cash and overtime. Exports stay in the module screens."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Cash balance" value={formatCurrency(cashSummary.currentCashBalance)} description="Custodian balance" icon={Wallet} tone="mint" />
        <StatCard label="Month spend" value={formatCurrency(cashSummary.thisMonthExpenses)} description="Cash and card expenses" icon={ReceiptText} tone="rose" />
        <StatCard label="OT payable" value={formatCurrency(overtimeAmount)} description="Approved this month" icon={Clock3} tone="navy" />
        <StatCard label="Pending OT" value={`${pendingOvertimeCount}`} description="Awaiting approval" icon={BarChart3} tone={pendingOvertimeCount ? "amber" : "slate"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportCard
          title="Petty cash"
          description="Ledger statement, monthly summary, pending reimbursements, and voided records."
          href="/app/petty-cash"
          actionLabel="Open Cash"
        >
          {canViewCash ? (
            <>
              <MetricRow label="Pending reimbursement" value={formatCurrency(cashSummary.pendingReimbursementTotal)} />
              <MetricRow label="Unclaimed expenses" value={formatCurrency(cashSummary.unsubmittedExpensesTotal)} />
              <MetricRow label="Voided records" value={`${cashRows.filter((row) => row.voided).length}`} />
              <MetricRow label="Recent closings" value={`${cashLedger?.closings.length ?? 0}`} />
              {categoryTotals.length ? (
                <div className="pt-2">
                  <p className="section-label mb-2">Expense by category</p>
                  <div className="space-y-1.5">
                    {categoryTotals.map(([category, amount]) => (
                      <MetricRow key={category} label={category} value={formatCurrency(amount)} compact />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon={Wallet}
              title="Cash reports restricted"
              description="Ask an owner or admin if your role needs access."
              className="min-h-[150px] border-0 bg-surface-muted"
            />
          )}
        </ReportCard>

        <ReportCard
          title="Overtime"
          description="Employee monthly summary, pending approvals, payroll export, and paid status."
          href="/app/overtime"
          actionLabel="Open Overtime"
        >
          <MetricRow label="Approved day OT" value={`${(dayOt / 60).toFixed(2)} hrs`} />
          <MetricRow label="Approved night OT" value={`${(nightOt / 60).toFixed(2)} hrs`} />
          <MetricRow label="Weekend/holiday OT" value={`${(weekendHolidayOt / 60).toFixed(2)} hrs`} />
          <MetricRow label="Payroll export" value="Use module CSV" />
        </ReportCard>
      </div>

      <Callout
        title="Exports"
        description="Use the export buttons inside Cash and Overtime for current filtered CSV exports."
        icon={Download}
        tone="navy"
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/app/petty-cash">Cash exports</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/app/overtime">Overtime exports</Link>
          </Button>
        </div>
      </Callout>
    </div>
  );
}

function ReportCard({
  title,
  description,
  href,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-text-primary">{title}</p>
            <p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p>
          </div>
          <Button asChild variant="ghost" size="xs">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        </div>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
      <span className={compact ? "truncate text-sm text-text-secondary" : "text-sm font-medium text-text-primary"}>{label}</span>
      <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-text-primary">{value}</span>
    </div>
  );
}
