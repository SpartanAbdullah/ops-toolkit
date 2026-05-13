import { ArrowDownRight, ArrowUpRight, HandCoins, Hourglass, ReceiptText, Wallet } from "lucide-react";

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
      <div className="overflow-hidden rounded-2xl border border-primary-200 bg-primary-600 text-white shadow-elevated">
        <div className="grid-noise relative px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-2xs uppercase tracking-wide text-white/70">Current cash on hand</p>
          <p className="mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
            {formatCurrency(summary.currentCashBalance)}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
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

      {/* Secondary stats — only when there's data */}
      {hasAnyRows ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            label="This month expenses"
            value={formatCurrency(summary.thisMonthExpenses)}
            description="Cash + card spend"
            icon={ReceiptText}
            tone="rose"
          />
          <StatCard
            label="Pending reimbursement"
            value={formatCurrency(summary.pendingReimbursementTotal)}
            description="Submitted, not back yet"
            icon={Hourglass}
            tone="amber"
          />
          <StatCard
            label="Reimbursed"
            value={formatCurrency(summary.reimbursementsReceivedTotal)}
            description="Money returned"
            icon={HandCoins}
            tone="mint"
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
