"use client";

import { Loader2 } from "lucide-react";

import { formatPettyCashDate } from "@/lib/petty-cash";
import { formatCurrency } from "@/lib/utils";
import { usePettyCashPending } from "@/components/app/petty-cash-pending-provider";

export function PettyCashPendingRows() {
  const ctx = usePettyCashPending();
  if (!ctx || !ctx.pendingRows.length) return null;

  return (
    <div className="space-y-2">
      {ctx.pendingRows.map((row) => (
        <div
          key={row.tempId}
          className="flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50/60 p-4 shadow-card animate-pulse"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-accent-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold leading-tight text-text-primary">
              Saving {row.typeLabel}…
            </p>
            <p className="mt-0.5 truncate text-sm text-text-secondary">{row.category}</p>
            <p className="mt-0.5 text-2xs uppercase tracking-wide text-text-muted">
              {formatPettyCashDate(row.occurredAt)}
            </p>
          </div>
          <p className="shrink-0 font-display text-base font-semibold tabular-nums text-text-primary">
            {formatCurrency(Math.abs(row.amount))}
          </p>
        </div>
      ))}
    </div>
  );
}
