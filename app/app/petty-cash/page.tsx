import { ArrowDownRight, ArrowUpRight, BadgeCheck, CreditCard, HandCoins, Hourglass, ReceiptText, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { PettyCashExportButton } from "@/components/app/petty-cash-export-button";
import { PettyCashFilterBar } from "@/components/app/petty-cash-filter-bar";
import { PettyCashLedger } from "@/components/app/petty-cash-ledger";
import { PettyCashTransactionSheet } from "@/components/app/petty-cash-transaction-sheet";
import { Callout } from "@/components/ui/callout";
import { StatCard } from "@/components/ui/stat-card";
import { getAppContext } from "@/lib/app/session";
import {
  buildRunningLedgerRows,
  calculatePettyCashSummary,
  filterPettyCashRows,
  type PettyCashLedgerRow,
} from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Petty Cash",
});

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PettyCashPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getAppContext();
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = {
    from: getQueryValue(resolvedSearchParams.from) ?? "",
    to: getQueryValue(resolvedSearchParams.to) ?? "",
    type: getQueryValue(resolvedSearchParams.type) ?? "all",
    category: getQueryValue(resolvedSearchParams.category) ?? "all",
    reimbursement: getQueryValue(resolvedSearchParams.reimbursement) ?? "all",
  };

  const account = await prisma.pettyCashAccount.findUnique({
    where: { userId: context.user.id },
    include: {
      transactions: { orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }] },
    },
  });

  const ledgerRows: PettyCashLedgerRow[] = account
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

  const summary = calculatePettyCashSummary(ledgerRows);
  // Reverse for display (newest first), then filter
  const displayRows = [...ledgerRows].reverse();
  const filteredRows = filterPettyCashRows(displayRows, filters);
  const categories = Array.from(new Set(ledgerRows.map((row) => row.category))).sort((a, b) => a.localeCompare(b));
  const hasOpeningBalance = ledgerRows.some((row) => row.type === "opening_balance");
  const hasAnyRows = ledgerRows.length > 0;
  const filtersActive = Boolean(
    filters.from || filters.to || (filters.type && filters.type !== "all") || (filters.category && filters.category !== "all") || (filters.reimbursement && filters.reimbursement !== "all"),
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <AppPageHeader
        eyebrow="Cash"
        badge={hasAnyRows ? `${summary.transactionCount} entries` : "Ledger"}
        title="Petty Cash"
        description="Live balance, expenses, top-ups, and reimbursement tracking."
        actions={
          <div className="flex items-center gap-2">
            <PettyCashExportButton rows={filteredRows} />
            <PettyCashTransactionSheet
              buttonLabel={hasOpeningBalance ? "Add" : "Open balance"}
              buttonIcon
              categories={categories}
              hasOpeningBalance={hasOpeningBalance}
            />
          </div>
        }
      />

      {/* Big balance hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-700 bg-primary-700 text-white shadow-elevated">
        {/* radial gold glow top-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.35), transparent 60%)" }}
        />
        {/* dot pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        {/* gold accent stripe */}
        <div aria-hidden="true" className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r from-accent-500 via-accent-500 to-transparent sm:inset-x-7" />

        <div className="relative px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-2xs uppercase tracking-[0.18em] text-accent-500">Current balance</p>
          <p className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-[52px]">
            {formatCurrency(summary.currentCashBalance)}
          </p>
          {summary.cardOutstandingTotal > 0 ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-white/5 px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-2xs uppercase tracking-wide text-white/70">Card owed</span>
              <span className="font-display text-sm font-semibold tabular-nums text-accent-500">
                −{formatCurrency(summary.cardOutstandingTotal)}
              </span>
              <span className="text-2xs uppercase tracking-wide text-white/50">·</span>
              <span className="text-2xs uppercase tracking-wide text-white/70">Net</span>
              <span className="font-display text-sm font-semibold tabular-nums text-white">
                {formatCurrency(summary.netPosition)}
              </span>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-white/85">
              <ArrowDownRight className="h-4 w-4 text-accent-500" />
              <span className="font-semibold tabular-nums">{formatCurrency(summary.thisMonthExpenses)}</span>
              <span className="text-2xs uppercase tracking-wide text-white/60">this month</span>
            </span>
            {summary.pendingReimbursementTotal > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-white/85">
                <Hourglass className="h-4 w-4 text-accent-500" />
                <span className="font-semibold tabular-nums">{formatCurrency(summary.pendingReimbursementTotal)}</span>
                <span className="text-2xs uppercase tracking-wide text-white/60">pending reimb.</span>
              </span>
            ) : null}
            {summary.reimbursementsReceivedTotal > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-white/85">
                <ArrowUpRight className="h-4 w-4 text-mint-500" />
                <span className="font-semibold tabular-nums">{formatCurrency(summary.reimbursementsReceivedTotal)}</span>
                <span className="text-2xs uppercase tracking-wide text-white/60">received</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {!hasOpeningBalance ? (
        <Callout
          title="Set the opening balance"
          description="Start with the actual cash on hand. After that, log every top-up, expense, and reimbursement."
          icon={Wallet}
          tone="amber"
        >
          <PettyCashTransactionSheet
            buttonLabel="Set opening balance"
            buttonVariant="accent"
            buttonSize="sm"
            categories={categories}
            hasOpeningBalance={false}
          />
        </Callout>
      ) : null}

      {/* Smart prompt: claim what hasn't been submitted yet */}
      {hasOpeningBalance && summary.unsubmittedExpensesTotal > 0 ? (
        <Callout
          title={`${formatCurrency(summary.unsubmittedExpensesTotal)} ready to claim`}
          description="You have unclaimed expenses sitting on the books. File a reimbursement claim with accounts to recover this back into the float."
          icon={ReceiptText}
          tone="amber"
        >
          <div className="flex flex-wrap gap-2">
            <PettyCashTransactionSheet
              buttonLabel={`Submit claim for ${formatCurrency(summary.unsubmittedExpensesTotal)}`}
              buttonVariant="accent"
              buttonSize="sm"
              categories={categories}
              hasOpeningBalance={hasOpeningBalance}
              initialType="reimbursement_submitted"
              prefilledAmount={summary.unsubmittedExpensesTotal.toFixed(2)}
            />
            <PettyCashTransactionSheet
              buttonLabel="Different amount"
              buttonVariant="secondary"
              buttonSize="sm"
              categories={categories}
              hasOpeningBalance={hasOpeningBalance}
              initialType="reimbursement_submitted"
            />
          </div>
        </Callout>
      ) : null}

      {/* Card outstanding banner */}
      {hasOpeningBalance && summary.cardOutstandingTotal > 0 ? (
        <Callout
          title={`${formatCurrency(summary.cardOutstandingTotal)} outstanding on card`}
          description="Card spend hasn't been paid back yet. Settle when the card balance is cleared (from personal bank, reimbursement, or any source)."
          icon={CreditCard}
          tone="amber"
        >
          <PettyCashTransactionSheet
            buttonLabel={`Record settlement of ${formatCurrency(summary.cardOutstandingTotal)}`}
            buttonVariant="accent"
            buttonSize="sm"
            categories={categories}
            hasOpeningBalance={hasOpeningBalance}
            initialType="card_settlement"
            prefilledAmount={summary.cardOutstandingTotal.toFixed(2)}
          />
        </Callout>
      ) : null}

      {/* Pending claim banner */}
      {hasOpeningBalance && summary.pendingReimbursementTotal > 0 ? (
        <Callout
          title={`${formatCurrency(summary.pendingReimbursementTotal)} awaiting reimbursement`}
          description="A claim has been filed with accounts but the float hasn't been replenished yet. Record it as Reimbursement Received when the money lands."
          icon={Hourglass}
          tone="navy"
        >
          <PettyCashTransactionSheet
            buttonLabel="Record reimbursement received"
            buttonVariant="default"
            buttonSize="sm"
            categories={categories}
            hasOpeningBalance={hasOpeningBalance}
            initialType="reimbursement_received"
            prefilledAmount={summary.pendingReimbursementTotal.toFixed(2)}
          />
        </Callout>
      ) : null}

      {/* Secondary stats — only when there's data */}
      {hasAnyRows ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Card outstanding"
            value={formatCurrency(summary.cardOutstandingTotal)}
            description="Spent on card, not paid"
            icon={CreditCard}
            tone={summary.cardOutstandingTotal > 0 ? "amber" : "slate"}
          />
          <StatCard
            label="This month spend"
            value={formatCurrency(summary.thisMonthExpenses)}
            description="Cash + card combined"
            icon={ReceiptText}
            tone="rose"
          />
          <StatCard
            label="Unclaimed"
            value={formatCurrency(summary.unsubmittedExpensesTotal)}
            description="Spent but not submitted"
            icon={ReceiptText}
            tone={summary.unsubmittedExpensesTotal > 0 ? "amber" : "slate"}
          />
          <StatCard
            label="Awaiting reimbursement"
            value={formatCurrency(summary.pendingReimbursementTotal)}
            description="Submitted, not received"
            icon={Hourglass}
            tone={summary.pendingReimbursementTotal > 0 ? "amber" : "slate"}
          />
        </div>
      ) : null}

      <PettyCashFilterBar filters={filters} categories={categories} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{filteredRows.length}</span> transactions
        </p>
      </div>

      <PettyCashLedger
        rows={filteredRows}
        hasAnyRows={hasAnyRows}
        filtersActive={filtersActive}
        resetHref="/app/petty-cash"
      />
    </div>
  );
}
