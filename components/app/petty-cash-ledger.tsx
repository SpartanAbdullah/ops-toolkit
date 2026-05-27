import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, Ban, BanknoteArrowUp, CreditCard, HandCoins, MinusCircle, ReceiptText, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PettyCashEditSheet } from "@/components/app/petty-cash-edit-sheet";
import { PettyCashLedgerActions } from "@/components/app/petty-cash-ledger-actions";
import { PettyCashVoidButton } from "@/components/app/petty-cash-void-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPettyCashDate, type PettyCashLedgerRow } from "@/lib/petty-cash";

function getRowIcon(row: PettyCashLedgerRow): LucideIcon {
  switch (row.type) {
    case "opening_balance":
    case "cash_top_up":
      return BanknoteArrowUp;
    case "expense_cash":
      return MinusCircle;
    case "expense_card":
      return CreditCard;
    case "reimbursement_submitted":
      return ReceiptText;
    case "reimbursement_received":
      return HandCoins;
    case "card_settlement":
      return BadgeCheck;
    default:
      return Settings2;
  }
}

function getImpactColor(row: PettyCashLedgerRow) {
  if (row.cashImpact > 0) return "text-mint-600";
  if (row.cashImpact < 0) return "text-danger-600";
  return "text-text-muted";
}

function getIconBg(row: PettyCashLedgerRow) {
  if (row.cashImpact > 0) return "bg-mint-50 text-mint-600";
  if (row.cashImpact < 0) return "bg-danger-50 text-danger-600";
  // Card-related entries get an amber tint since they affect card outstanding, not cash
  if (row.type === "expense_card") return "bg-accent-50 text-accent-foreground";
  if (row.type === "card_settlement") return "bg-mint-50 text-mint-600";
  return "bg-surface-muted text-text-secondary";
}

export function PettyCashLedger({
  rows,
  hasAnyRows,
  filtersActive,
  resetHref,
  categories,
  canManage = true,
}: {
  rows: PettyCashLedgerRow[];
  hasAnyRows: boolean;
  filtersActive: boolean;
  resetHref?: string;
  categories: string[];
  canManage?: boolean;
}) {
  if (!rows.length) {
    return (
      <EmptyState
        icon={ReceiptText}
        title={hasAnyRows ? "No transactions match these filters" : "No petty cash entries yet"}
        description={
          hasAnyRows && filtersActive
            ? "Adjust the filters to see more results."
            : "Tap the + button to set the opening balance and start tracking."
        }
        action={
          hasAnyRows && filtersActive && resetHref ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={resetHref}>Reset filters</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const Icon = getRowIcon(row);
        const canVoid = canManage && !row.voided && row.type !== "opening_balance";
        const canEdit = canManage && !row.voided;
        return (
          <div
            key={row.id}
            className={`rounded-2xl border border-border bg-white p-4 shadow-card ${row.voided ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconBg(row)}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-display text-[15px] font-semibold leading-tight text-text-primary ${row.voided ? "line-through" : ""}`}>{row.typeLabel}</p>
                    <p className={`mt-0.5 truncate text-sm text-text-secondary ${row.voided ? "line-through" : ""}`}>{row.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {row.voided ? (
                      <>
                        <p className="font-display text-base font-semibold tabular-nums text-text-muted line-through">
                          {row.amountLabel}
                        </p>
                        <Badge variant="rose" className="mt-1">
                          <Ban className="h-3 w-3" />
                          Voided
                        </Badge>
                      </>
                    ) : row.type === "expense_card" ? (
                      <>
                        <p className="font-display text-base font-semibold tabular-nums text-accent-foreground">
                          {row.amountLabel}
                        </p>
                        <p className="mt-0.5 text-2xs uppercase tracking-wide text-accent-foreground/70">on card</p>
                      </>
                    ) : row.type === "card_settlement" ? (
                      <>
                        <p className="font-display text-base font-semibold tabular-nums text-mint-600">
                          −{row.amountLabel}
                        </p>
                        <p className="mt-0.5 text-2xs uppercase tracking-wide text-mint-600/80">card paid</p>
                      </>
                    ) : (
                      <>
                        <p className={`font-display text-base font-semibold tabular-nums ${getImpactColor(row)}`}>
                          {row.cashImpact >= 0 ? "+" : "−"}{row.amountLabel}
                        </p>
                        <p className="mt-0.5 text-2xs text-text-muted">Balance after: {row.runningBalanceLabel}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-text-muted">
                  <span>{formatPettyCashDate(row.occurredOn)}</span>
                  {row.vendorPayee ? (
                    <>
                      <span>·</span>
                      <span className="truncate">{row.vendorPayee}</span>
                    </>
                  ) : null}
                  {row.paymentMethodLabel ? (
                    <>
                      <span>·</span>
                      <span>{row.paymentMethodLabel}</span>
                    </>
                  ) : null}
                  {!row.voided && row.reimbursementStatus !== "not_applicable" ? (
                    <Badge variant={row.reimbursementStatus === "received" ? "mint" : "amber"} className="ml-1">
                      {row.reimbursementStatus === "received" ? "Reimbursed" : "Pending reimb."}
                    </Badge>
                  ) : null}
                </div>

                {row.voided && row.voidedReason ? (
                  <p className="mt-2 rounded-lg border border-danger-50 bg-danger-50/60 px-3 py-2 text-2xs leading-4 text-danger-600">
                    <span className="font-semibold">Void reason:</span> {row.voidedReason}
                  </p>
                ) : null}

                {!row.voided && row.notes ? (
                  <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm leading-5 text-text-secondary">{row.notes}</p>
                ) : null}

                {!row.voided && (row.referenceNumber || row.receiptReference || row.notes) ? (
                  <div className="mt-2">
                    <PettyCashLedgerActions
                      referenceNumber={row.referenceNumber}
                      receiptReference={row.receiptReference}
                      notes={row.notes}
                    />
                  </div>
                ) : null}

                {(canEdit || canVoid) ? (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
                    {canEdit ? <PettyCashEditSheet transaction={row} categories={categories} /> : null}
                    {canVoid ? <PettyCashVoidButton transaction={row} /> : null}
                  </div>
                ) : null}
              </div>
            </div>
            {!row.voided && row.cashImpact !== 0 ? (
              <div className="mt-2 flex items-center justify-end text-2xs text-text-muted">
                {row.cashImpact > 0 ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3 text-mint-600" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3 text-danger-600" />
                )}
                {row.cashImpactLabel}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
