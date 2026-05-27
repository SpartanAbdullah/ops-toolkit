import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Plus,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { CreateTeamForm, JoinTeamForm } from "@/components/app/team-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { canManagePettyCashLedger, canReviewOvertimeEntries, canViewTeamOvertime } from "@/lib/app/authorization";
import { getAppContext } from "@/lib/app/session";
import { buildRunningLedgerRows, calculatePettyCashSummary } from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";
import { getZonedMonthBounds } from "@/lib/tz";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({ title: "Home" });
export const dynamic = "force-dynamic";

function toDateLabel(value: Date | null) {
  if (!value) return "No activity yet";
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function AppIndexPage() {
  const context = await getAppContext();
  const timezone = context.profile?.timezone || "Asia/Dubai";
  const canManageCash = canManagePettyCashLedger(context.activeMembership?.role);
  const canReviewOvertime = canReviewOvertimeEntries(context.activeMembership?.role);
  const canViewAllOvertime = canViewTeamOvertime(context.activeMembership?.role);

  if (!context.activeTeam) {
    return (
      <div className="space-y-5 animate-fade-up">
        <AppPageHeader
          eyebrow="Home"
          badge="Workspace required"
          title="Set up your workspace"
          description="Create a company workspace or join one with an invite code before using cash or overtime records."
        />

        <Callout
          title="Public signup is open. Company data is not."
          description="Every cash and overtime record is scoped to a workspace. New users start here until they create or join one."
          icon={ShieldCheck}
          tone="navy"
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-text-primary">Create company</p>
                  <p className="mt-1 text-sm leading-5 text-text-secondary">Use this if you are setting up the workspace.</p>
                </div>
              </div>
              <CreateTeamForm />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-text-primary">Join workspace</p>
                  <p className="mt-1 text-sm leading-5 text-text-secondary">Use the 6-character code from an owner or admin.</p>
                </div>
              </div>
              <JoinTeamForm />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const monthBounds = getZonedMonthBounds(new Date(), timezone);
  const [cashLedger, overtimeEntries, pendingApprovalCount] = await Promise.all([
    prisma.cashLedger.findFirst({
      where: { teamId: context.activeTeam.id },
      select: {
        transactions: {
          select: {
            id: true,
            occurredAt: true,
            createdAt: true,
            updatedAt: true,
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
    }),
    prisma.overtimeEntry.findMany({
      where: canViewAllOvertime
        ? { teamId: context.activeTeam.id }
        : { teamId: context.activeTeam.id, workerUserId: context.user.id },
      select: {
        workedDate: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        overtimeMinutes: true,
        dayOvertimeMinutes: true,
        nightOvertimeMinutes: true,
        calculatedOvertimeAmount: true,
        approvedOvertimeAmount: true,
      },
      orderBy: [{ workedDate: "desc" }, { createdAt: "desc" }],
      take: 200,
    }),
    canReviewOvertime
      ? prisma.overtimeEntry.count({
          where: { teamId: context.activeTeam.id, status: "pending" },
        })
      : Promise.resolve(0),
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
  const approvedThisMonth = overtimeEntries.filter((entry) => {
    const key = dateKey(entry.workedDate);
    return (
      (entry.status === "approved" || entry.status === "auto_approved")
      && key >= monthBounds.from
      && key <= monthBounds.to
    );
  });
  const overtimeAmountThisMonth = approvedThisMonth.reduce(
    (total, entry) => total + Number(entry.approvedOvertimeAmount ?? entry.calculatedOvertimeAmount),
    0,
  );
  const overtimeMinutesThisMonth = approvedThisMonth.reduce((total, entry) => total + entry.overtimeMinutes, 0);
  const lastCashUpdate = cashLedger?.transactions.reduce<Date | null>(
    (latest, transaction) => (!latest || transaction.updatedAt > latest ? transaction.updatedAt : latest),
    null,
  ) ?? null;
  const lastOvertimeUpdate = overtimeEntries.reduce<Date | null>(
    (latest, entry) => (!latest || entry.updatedAt > latest ? entry.updatedAt : latest),
    null,
  );
  const lastUpdated = [lastCashUpdate, lastOvertimeUpdate].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] ?? null;

  return (
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Home"
        badge={context.activeTeam.name}
        title="Today"
        description="Cash position, overtime approvals, and the next operational actions."
        actions={
          <div className="hidden gap-2 sm:flex">
            {canManageCash ? (
              <Button asChild size="sm">
                <Link href="/app/petty-cash?action=add"><Plus className="h-4 w-4" />Cash entry</Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="sm">
              <Link href="/app/overtime?action=log"><Clock3 className="h-4 w-4" />Overtime</Link>
            </Button>
          </div>
        }
      />

      <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="mint"><CheckCircle2 className="h-3 w-3" />Synced</Badge>
            <Badge variant="navy">Saved</Badge>
          </div>
          <p className="text-2xs text-text-muted">Last updated: {toDateLabel(lastUpdated)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Cash balance"
          value={formatCurrency(cashSummary.currentCashBalance)}
          description="Current ledger balance"
          icon={Wallet}
          tone="mint"
        />
        <StatCard
          label="Pending reimb."
          value={formatCurrency(cashSummary.pendingReimbursementTotal)}
          description="Submitted, not received"
          icon={ReceiptText}
          tone={cashSummary.pendingReimbursementTotal > 0 ? "amber" : "slate"}
        />
        <StatCard
          label="Pending approvals"
          value={`${pendingApprovalCount}`}
          description="Overtime awaiting review"
          icon={ClipboardCheck}
          tone={pendingApprovalCount > 0 ? "amber" : "slate"}
        />
        <StatCard
          label="Month OT"
          value={formatCurrency(overtimeAmountThisMonth)}
          description={`${(overtimeMinutesThisMonth / 60).toFixed(2)} approved hrs`}
          icon={Clock3}
          tone="navy"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {canManageCash ? (
          <QuickAction href="/app/petty-cash?action=add" icon={Wallet} label="Add Cash Entry" detail="Expense, top-up, reimbursement" />
        ) : (
          <QuickAction href="/app/petty-cash" icon={Wallet} label="Cash" detail="View access depends on role" muted />
        )}
        <QuickAction href="/app/overtime?action=log" icon={Clock3} label="Add Overtime" detail="Log shift and preview AED" />
        <QuickAction href="/app/overtime?tab=approvals" icon={ClipboardCheck} label="Approvals" detail={`${pendingApprovalCount} pending`} muted={!canReviewOvertime} />
        <QuickAction href="/app/reports" icon={BarChart3} label="Reports" detail="Cash and overtime summaries" />
      </div>

      {cashRows.length || overtimeEntries.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <ActionPanel
            title="Petty cash actions"
            emptyTitle="No cash actions"
            emptyDescription="Cash actions appear when there are reimbursements, card spend, or unclaimed expenses."
            items={[
              cashSummary.unsubmittedExpensesTotal > 0 ? `${formatCurrency(cashSummary.unsubmittedExpensesTotal)} ready to claim` : null,
              cashSummary.pendingReimbursementTotal > 0 ? `${formatCurrency(cashSummary.pendingReimbursementTotal)} awaiting reimbursement` : null,
              cashSummary.cardOutstandingTotal > 0 ? `${formatCurrency(cashSummary.cardOutstandingTotal)} card outstanding` : null,
            ]}
            href="/app/petty-cash"
          />
          <ActionPanel
            title="Overtime actions"
            emptyTitle="No overtime actions"
            emptyDescription="Pending approvals and payroll actions will appear here."
            items={[
              pendingApprovalCount > 0 ? `${pendingApprovalCount} shifts awaiting approval` : null,
              overtimeEntries.length === 0 ? "No overtime records yet" : null,
            ]}
            href="/app/overtime"
          />
        </div>
      ) : (
        <EmptyState
          icon={Clock3}
          title="No operational records yet"
          description="Start by logging an overtime shift or opening the petty cash ledger."
          action={
            <>
              <Button asChild size="sm">
                <Link href="/app/overtime?action=log">Log overtime</Link>
              </Button>
              {canManageCash ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/app/petty-cash?action=add">Open cash ledger</Link>
                </Button>
              ) : null}
            </>
          }
        />
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  detail,
  muted = false,
}: {
  href: string;
  icon: typeof Wallet;
  label: string;
  detail: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "tap-highlight rounded-2xl border border-border bg-white p-4 shadow-card transition active:scale-[0.98] hover:border-primary-200 hover:bg-primary-50",
        muted && "bg-surface-muted",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-base font-semibold text-text-primary">{label}</span>
          <span className="mt-1 block text-sm leading-5 text-text-secondary">{detail}</span>
        </span>
      </div>
    </Link>
  );
}

function ActionPanel({
  title,
  emptyTitle,
  emptyDescription,
  items,
  href,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: Array<string | null>;
  href: string;
}) {
  const activeItems = items.filter(Boolean) as string[];

  return (
    <Card>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-base font-semibold text-text-primary">{title}</p>
          <Button asChild variant="ghost" size="xs">
            <Link href={href}>Open</Link>
          </Button>
        </div>
        {activeItems.length ? (
          <div className="space-y-2">
            {activeItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5 text-sm">
                <span className="font-medium text-text-primary">{item}</span>
                <Badge variant="amber">Action</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title={emptyTitle}
            description={emptyDescription}
            className="min-h-[150px] border-0 bg-surface-muted"
          />
        )}
      </CardContent>
    </Card>
  );
}
