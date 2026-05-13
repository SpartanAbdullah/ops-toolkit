"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useOvertimePending } from "@/components/app/overtime-pending-provider";
import { formatOvertimeDate } from "@/lib/overtime";

export function OvertimePendingRows() {
  const ctx = useOvertimePending();
  if (!ctx || !ctx.pendingRows.length) return null;

  return (
    <div className="space-y-2">
      {ctx.pendingRows.map((row) => (
        <div
          key={row.tempId}
          className="rounded-2xl border border-accent-200 bg-accent-50/60 p-4 shadow-card animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="amber">Saving</Badge>
                {row.isHoliday ? (
                  <Badge variant="amber">Holiday</Badge>
                ) : row.isWeekend ? (
                  <Badge variant="navy">Rest day</Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-accent-600" />
                <p className="font-display text-base font-semibold text-text-primary">
                  {formatOvertimeDate(row.workedDate)}
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                {row.startTimeLabel}–{row.endTimeLabel}
                {row.overnight ? " · overnight" : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-base font-semibold tabular-nums text-text-primary">{row.amountLabel}</p>
              <p className="mt-0.5 text-2xs uppercase tracking-wide text-text-muted">{row.overtimeLabel} OT</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
