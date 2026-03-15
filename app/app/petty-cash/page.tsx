import { ArrowDownRight, ArrowUpRight, CircleDollarSign, HandCoins, Hourglass, ReceiptText, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { PettyCashExportButton } from "@/components/app/petty-cash-export-button";
import { PettyCashFilterBar } from "@/components/app/petty-cash-filter-bar";
import { PettyCashLedger } from "@/components/app/petty-cash-ledger";
import { PettyCashTransactionSheet } from "@/components/app/petty-cash-transaction-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { SummaryBlock } from "@/components/ui/summary-block";
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
  description: "Track petty cash balances, expenses, reimbursements, top-ups, and adjustments inside the authenticated Ops Toolkit workspace.",
  path: "/app/petty-cash",
  noIndex: true,
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
    where: {
      userId: context.user.id,
    },
    include: {
      transactions: {
        orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
      },
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
  const filteredRows = filterPettyCashRows(ledgerRows, filters);
  const categories = Array.from(new Set(ledgerRows.map((row) => row.category))).sort((left, right) => left.localeCompare(right));
  const hasOpeningBalance = ledgerRows.some((row) => row.type === "opening_balance");
  const hasAnyRows = ledgerRows.length > 0;
  const filtersActive = Boolean(filters.from || filters.to || (filters.type && filters.type !== "all") || (filters.category && filters.category !== "all") || (filters.reimbursement && filters.reimbursement !== "all"));

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Cash"
        badge={hasAnyRows ? `${summary.transactionCount} entries` : "Operator ledger"}
        title="Track petty cash without spreadsheet clutter"
        description="See the live balance, recent movements, and reimbursement status in one mobile-friendly ledger."
        actions={
          <>
            <PettyCashTransactionSheet
              buttonLabel={hasOpeningBalance ? "Add transaction" : "Set opening balance"}
              categories={categories}
              hasOpeningBalance={hasOpeningBalance}
            />
            <PettyCashExportButton rows={filteredRows} />
          </>
        }
      />

      {!hasOpeningBalance ? (
        <Callout
          title="Start with the opening balance"
          description="The first cash entry should be the opening float. After that, top-ups, expenses, reimbursements, and adjustments keep the running balance accurate."
          icon={Wallet}
          tone="amber"
        >
          <div className="flex flex-wrap gap-3">
            <PettyCashTransactionSheet buttonLabel="Set opening balance" categories={categories} hasOpeningBalance={false} />
            <Badge variant="subtle">Single-operator ledger</Badge>
          </div>
        </Callout>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current balance"
          value={formatCurrency(summary.currentCashBalance)}
          description="Live cash on hand from the ledger."
          icon={CircleDollarSign}
          tone="green"
        />
        <StatCard
          label="This month expenses"
          value={formatCurrency(summary.thisMonthExpenses)}
          description="Cash and card spend recorded this month."
          icon={ReceiptText}
          tone="blue"
        />
        <StatCard
          label="Pending reimbursement"
          value={formatCurrency(summary.pendingReimbursementTotal)}
          description="Claims submitted but not received back yet."
          icon={Hourglass}
          tone="amber"
        />
        <StatCard
          label="Reimbursements received"
          value={formatCurrency(summary.reimbursementsReceivedTotal)}
          description="Money returned back into the operating cycle."
          icon={HandCoins}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <PettyCashFilterBar filters={filters} categories={categories} />
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionHeader
              eyebrow="How it works"
              title="Balance logic at a glance"
              description="These cues help casual users understand what changes cash on hand immediately."
            />
            <div className="grid gap-3">
              <SummaryBlock
                label="Cash increases"
                value={<span className="inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Opening balance, top-ups, reimbursements received, positive adjustments</span>}
                tone="success"
              />
              <SummaryBlock
                label="Cash decreases"
                value={<span className="inline-flex items-center gap-2"><ArrowDownRight className="h-4 w-4" /> Cash expenses and negative adjustments</span>}
                tone="danger"
              />
              <SummaryBlock
                label="Tracked only"
                value="Card expenses and reimbursement submissions"
                hint="These give visibility without changing physical cash immediately."
                tone="default"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasAnyRows ? (
        <EmptyState
          icon={Wallet}
          title="Your petty cash ledger is empty"
          description="Start with the opening balance, then add real movements as money leaves, comes back, or needs adjustment."
          action={
            <>
              <PettyCashTransactionSheet buttonLabel="Set opening balance" categories={categories} hasOpeningBalance={false} />
              <Button asChild variant="secondary">
                <a href="/tools/petty-cash-tracker">View public tool</a>
              </Button>
            </>
          }
        />
      ) : null}

      <PettyCashLedger rows={filteredRows} hasAnyRows={hasAnyRows} filtersActive={filtersActive} resetHref="/app/petty-cash" />
    </div>
  );
}
