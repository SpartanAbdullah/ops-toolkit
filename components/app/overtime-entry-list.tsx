"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Calendar, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

import { approveOvertimeEntryQuickAction } from "@/app/app/overtime/actions";
import { OvertimeApprovalSheet } from "@/components/app/overtime-approval-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineMessage } from "@/components/ui/inline-message";
import { formatOvertimeDate, type OvertimeLedgerRow } from "@/lib/overtime";

export function OvertimeEntryList({
  rows,
  hasAnyRows,
  filtersActive,
  showWorkerName,
  showAdminActions,
  emptyTitle,
  emptyDescription,
  resetHref,
}: {
  rows: OvertimeLedgerRow[];
  hasAnyRows: boolean;
  filtersActive: boolean;
  showWorkerName: boolean;
  showAdminActions: boolean;
  emptyTitle: string;
  emptyDescription: string;
  resetHref?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

      {!rows.length ? (
        <EmptyState
          icon={ClipboardList}
          title={hasAnyRows ? emptyTitle : "No overtime entries yet"}
          description={hasAnyRows && filtersActive ? emptyDescription : "Tap the + button to log your first shift."}
          action={
            hasAnyRows && filtersActive && resetHref ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={resetHref}>Reset filters</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        rows.map((row) => (
          <EntryCard
            key={row.id}
            row={row}
            showWorkerName={showWorkerName}
            showAdminActions={showAdminActions}
            disabled={isPending && pendingApproveId === row.id}
            onApprove={() => {
              setMessage(null);
              setPendingApproveId(row.id);
              startTransition(async () => {
                const result = await approveOvertimeEntryQuickAction(row.id);
                setPendingApproveId(null);
                setMessage({ tone: result.status === "success" ? "success" : "error", text: result.message });
                router.refresh();
              });
            }}
          />
        ))
      )}
    </div>
  );
}

function EntryCard({
  row,
  showWorkerName,
  showAdminActions,
  disabled,
  onApprove,
}: {
  row: OvertimeLedgerRow;
  showWorkerName: boolean;
  showAdminActions: boolean;
  disabled: boolean;
  onApprove: () => void;
}) {
  const dateLabel = formatOvertimeDate(row.workedOn);
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
            {row.isHoliday ? (
              <Badge variant="amber">Holiday</Badge>
            ) : row.isWeekend ? (
              <Badge variant="navy">Rest day</Badge>
            ) : null}
            {row.isModifiedApproval ? <Badge variant="amber">Adjusted</Badge> : null}
            {row.wellbeingWarning ? <Badge variant="rose">{"> 2h"}</Badge> : null}
          </div>
          <p className="font-display text-base font-semibold text-text-primary">
            {showWorkerName ? row.workerName : dateLabel}
          </p>
          <p className="text-sm text-text-secondary">
            {showWorkerName ? <span className="font-medium">{dateLabel} · </span> : null}
            {row.startTimeLabel}–{row.endTimeLabel}
            {row.overnight ? " · overnight" : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-base font-semibold tabular-nums text-text-primary">{row.amountLabel}</p>
          <p className="mt-0.5 text-2xs uppercase tracking-wide text-text-muted">{row.overtimeLabel} OT</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-text-muted">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {row.totalWorkedLabel} worked</span>
        <span className="text-text-muted">·</span>
        <span>{row.paymentStatusLabel}</span>
        {row.approvedBy ? (
          <>
            <span>·</span>
            <span>{row.approvedBy}</span>
          </>
        ) : null}
      </div>

      {(row.notes || row.approvalComment) && (
        <div className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-sm leading-5 text-text-secondary">
          {row.notes ? <p>{row.notes}</p> : null}
          {row.approvalComment ? <p className="mt-1 italic">"{row.approvalComment}"</p> : null}
        </div>
      )}

      {showAdminActions && row.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            variant="success"
            disabled={disabled}
            onClick={onApprove}
          >
            {disabled ? "Approving..." : "Approve"}
          </Button>
          <OvertimeApprovalSheet entry={row} buttonLabel="Review" buttonVariant="secondary" buttonSize="sm" />
        </div>
      ) : null}
    </div>
  );
}
