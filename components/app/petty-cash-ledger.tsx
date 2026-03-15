import { ReceiptText } from "lucide-react";

import { PettyCashLedgerActions } from "@/components/app/petty-cash-ledger-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
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
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionHeader
          eyebrow="Ledger"
          title="Transaction history"
          description="Each row shows what moved, when it moved, and how it affected cash on hand."
          badge={`${rows.length} visible`}
        />

        {!rows.length ? (
          <EmptyState
            icon={ReceiptText}
            title={hasAnyRows ? "No transactions match these filters" : "No petty cash entries yet"}
            description={hasAnyRows && filtersActive ? "Adjust the filters to bring back the full ledger." : "Set the opening balance first, then keep the ledger current with top-ups, expenses, reimbursements, and adjustments."}
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <ListRow
                key={row.id}
                title={row.typeLabel}
                subtitle={`${formatPettyCashDate(row.occurredOn)} · ${row.category}`}
                meta={row.paymentMethodLabel ?? "No separate payment method"}
                badges={<Badge variant={getStatusVariant(row)}>{row.statusLabel}</Badge>}
                aside={
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Running balance</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{row.runningBalanceLabel}</p>
                    <p className="mt-1 text-sm text-text-secondary">{row.cashImpactLabel}</p>
                  </div>
                }
                details={
                  <div className="space-y-2">
                    <p><span className="font-semibold text-text-primary">Amount:</span> {row.amountLabel}</p>
                    {row.vendorPayee ? <p><span className="font-semibold text-text-primary">Vendor / payee:</span> {row.vendorPayee}</p> : null}
                    {row.referenceNumber ? <p><span className="font-semibold text-text-primary">Ref:</span> {row.referenceNumber}</p> : null}
                    {row.receiptReference ? <p><span className="font-semibold text-text-primary">Receipt:</span> {row.receiptReference}</p> : null}
                    {row.notes ? <p>{row.notes}</p> : null}
                    {!row.vendorPayee && !row.referenceNumber && !row.receiptReference && !row.notes ? <p>No extra note.</p> : null}
                  </div>
                }
                actions={
                  <PettyCashLedgerActions
                    referenceNumber={row.referenceNumber}
                    receiptReference={row.receiptReference}
                    notes={row.notes}
                  />
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
