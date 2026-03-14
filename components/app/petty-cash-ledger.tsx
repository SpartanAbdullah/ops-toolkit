import { ReceiptText } from "lucide-react";

import { PettyCashLedgerActions } from "@/components/app/petty-cash-ledger-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { formatPettyCashDate, type PettyCashLedgerRow } from "@/lib/petty-cash";

function getStatusVariant(row: PettyCashLedgerRow) {
  if (row.reimbursementStatus === "pending") {
    return "amber" as const;
  }

  if (row.reimbursementStatus === "received") {
    return "green" as const;
  }

  if (row.cashImpact < 0) {
    return "red" as const;
  }

  if (row.cashImpact > 0) {
    return "blue" as const;
  }

  return "subtle" as const;
}

export function PettyCashLedger({
  rows,
  hasAnyRows,
  filtersActive,
}: {
  rows: PettyCashLedgerRow[];
  hasAnyRows: boolean;
  filtersActive: boolean;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl">Transaction ledger</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">Review every cash movement, its effect on the running balance, and the supporting notes or references attached to it.</p>
          </div>
          <div className="rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {rows.length} visible {rows.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!rows.length ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-500 shadow-sm">
              <ReceiptText className="h-6 w-6" />
            </div>
            <p className="mt-5 font-display text-2xl font-semibold text-slate-900">
              {hasAnyRows ? "No transactions match these filters" : "No petty cash entries yet"}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              {hasAnyRows && filtersActive
                ? "Adjust the filter range or reset the ledger filters to bring back the full history."
                : "Set the opening balance first, then keep the ledger current with top-ups, expenses, reimbursements, and adjustments."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Vendor / Payee</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Cash impact</th>
                    <th className="px-4 py-2">Running balance</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Notes / references</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 shadow-sm">
                      <td className="rounded-l-[1.4rem] px-4 py-4 align-top text-sm font-medium text-slate-900">{formatPettyCashDate(row.occurredOn)}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">{row.typeLabel}</p>
                          <p className="text-xs text-slate-500">{row.paymentMethodLabel ?? "No separate method"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-700">{row.category}</td>
                      <td className="px-4 py-4 align-top text-sm text-slate-700">{row.vendorPayee || "-"}</td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">{row.amountLabel}</td>
                      <td className="px-4 py-4 align-top text-sm font-medium text-slate-700">{row.cashImpactLabel}</td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">{row.runningBalanceLabel}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={getStatusVariant(row)}>{row.statusLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        <div className="space-y-1.5">
                          {row.referenceNumber ? <p><span className="font-semibold text-slate-700">Ref:</span> {row.referenceNumber}</p> : null}
                          {row.receiptReference ? <p><span className="font-semibold text-slate-700">Receipt:</span> {row.receiptReference}</p> : null}
                          {row.notes ? <p className="line-clamp-2">{row.notes}</p> : null}
                          {!row.referenceNumber && !row.receiptReference && !row.notes ? <p className="text-slate-400">No extra note</p> : null}
                        </div>
                      </td>
                      <td className="rounded-r-[1.4rem] px-4 py-4 align-top text-right">
                        <PettyCashLedgerActions
                          referenceNumber={row.referenceNumber}
                          receiptReference={row.receiptReference}
                          notes={row.notes}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 xl:hidden">
              {rows.map((row) => (
                <div key={row.id} className="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">{row.typeLabel}</p>
                        <Badge variant={getStatusVariant(row)}>{row.statusLabel}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{formatPettyCashDate(row.occurredOn)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/90 bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cash impact</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{row.cashImpactLabel}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</p>
                      <p className="text-sm text-slate-700">{row.category}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Vendor / Payee</p>
                      <p className="text-sm text-slate-700">{row.vendorPayee || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Amount</p>
                      <p className="text-sm font-semibold text-slate-900">{row.amountLabel}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Running balance</p>
                      <p className="text-sm font-semibold text-slate-900">{row.runningBalanceLabel}</p>
                    </div>
                  </div>
                  {(row.referenceNumber || row.receiptReference || row.notes) ? (
                    <div className="mt-5 rounded-[1.3rem] border border-white/90 bg-white/90 px-4 py-4 text-sm leading-6 text-slate-600 shadow-sm">
                      {row.referenceNumber ? <p><span className="font-semibold text-slate-700">Ref:</span> {row.referenceNumber}</p> : null}
                      {row.receiptReference ? <p><span className="font-semibold text-slate-700">Receipt:</span> {row.receiptReference}</p> : null}
                      {row.notes ? <p>{row.notes}</p> : null}
                    </div>
                  ) : null}
                  <div className="mt-5">
                    <PettyCashLedgerActions
                      referenceNumber={row.referenceNumber}
                      receiptReference={row.receiptReference}
                      notes={row.notes}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}