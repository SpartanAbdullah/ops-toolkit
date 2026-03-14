import { ArrowDownRight, ArrowUpRight, CircleDollarSign, HandCoins, Hourglass, ReceiptText, Wallet } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { PettyCashExportButton } from "@/components/app/petty-cash-export-button";
import { PettyCashFilterBar } from "@/components/app/petty-cash-filter-bar";
import { PettyCashLedger } from "@/components/app/petty-cash-ledger";
import { PettyCashTransactionSheet } from "@/components/app/petty-cash-transaction-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
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
    <div className="space-y-6 pb-10">
      <AppPageHeader
        eyebrow="Petty Cash"
        badge={hasAnyRows ? `${summary.transactionCount} ledger ${summary.transactionCount === 1 ? "entry" : "entries"}` : "Operator ledger"}
        title="Track petty cash with a real running balance"
        description="Record opening balance, top-ups, cash expenses, card expenses, reimbursements, and adjustments in one operator-friendly ledger. The module is now data-backed and ready for daily operational use."
        actions={
          <div className="flex flex-wrap gap-3">
            <PettyCashTransactionSheet
              buttonLabel={hasOpeningBalance ? "Add transaction" : "Set opening balance"}
              categories={categories}
              hasOpeningBalance={hasOpeningBalance}
            />
            <PettyCashExportButton rows={filteredRows} />
          </div>
        }
      />

      {!hasOpeningBalance ? (
        <Callout
          title="Start by setting the opening balance"
          description="The first ledger entry should define the starting petty cash float. After that, top-ups, expenses, reimbursements, and adjustments will all roll into the live balance automatically."
          icon={Wallet}
          tone="amber"
        >
          <div className="flex flex-wrap gap-3">
            <PettyCashTransactionSheet buttonLabel="Set opening balance" categories={categories} hasOpeningBalance={false} />
            <Badge variant="subtle">Single-operator ledger for MVP</Badge>
          </div>
        </Callout>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Current Cash Balance</CardTitle>
              <IconTile icon={CircleDollarSign} tone="green" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(summary.currentCashBalance)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Running balance across entries that directly change cash on hand.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">This Month Expenses</CardTitle>
              <IconTile icon={ReceiptText} tone="red" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(summary.thisMonthExpenses)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Cash and card expenses logged during the current month.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Pending Reimbursement</CardTitle>
              <IconTile icon={Hourglass} tone="amber" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(summary.pendingReimbursementTotal)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Submitted reimbursements that have not yet been received back.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Reimbursements Received</CardTitle>
              <IconTile icon={HandCoins} tone="blue" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(summary.reimbursementsReceivedTotal)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Total reimbursements received back into the operating cycle.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <PettyCashFilterBar filters={filters} categories={categories} />
        <Card>
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="text-2xl">How balance logic works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
            <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <p><span className="font-semibold text-slate-900">Cash increases:</span> Opening Balance, Cash Top-Up, Reimbursement Received, and positive Adjustments.</p>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
                <p><span className="font-semibold text-slate-900">Cash decreases:</span> Expense - Cash and negative Adjustments reduce cash on hand immediately.</p>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-sky-100 bg-sky-50/70 p-4">
              <p><span className="font-semibold text-slate-900">Tracked but not cash-impacting:</span> Expense - Card records spend visibility without changing cash. Reimbursement Submitted raises the pending reimbursement total until money is received.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasAnyRows ? (
        <Card>
          <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-5 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white text-slate-600 shadow-sm">
              <Wallet className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950">Your petty cash ledger is empty</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">Start with the opening balance, then add real movements as cash leaves the box, top-ups arrive, reimbursements are submitted or received, and manual adjustments are needed.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <PettyCashTransactionSheet buttonLabel="Set opening balance" categories={categories} hasOpeningBalance={false} />
              <Button asChild variant="outline">
                <a href="/tools/petty-cash-tracker">View public tool card</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <PettyCashLedger rows={filteredRows} hasAnyRows={hasAnyRows} filtersActive={filtersActive} />
    </div>
  );
}