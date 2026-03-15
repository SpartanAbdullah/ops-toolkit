"use client";

import { useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

import { approveOvertimeEntryQuickAction } from "@/app/app/overtime/actions";
import { OvertimeApprovalSheet } from "@/components/app/overtime-approval-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineMessage } from "@/components/ui/inline-message";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
import { formatOvertimeDate, type OvertimeLedgerRow } from "@/lib/overtime";

export function OvertimeEntryList({
  rows,
  hasAnyRows,
  filtersActive,
  showWorkerName,
  showAdminActions,
  emptyTitle,
  emptyDescription,
}: {
  rows: OvertimeLedgerRow[];
  hasAnyRows: boolean;
  filtersActive: boolean;
  showWorkerName: boolean;
  showAdminActions: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionHeader
          eyebrow="Ledger"
          title="Overtime entries"
          description="Review worked time, OT value, approval state, and payment status in one stacked view that works on mobile."
          badge={`${rows.length} visible`}
        />

        {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

        {!rows.length ? (
          <EmptyState
            icon={ClipboardList}
            title={hasAnyRows ? emptyTitle : "No overtime entries yet"}
            description={hasAnyRows && filtersActive ? emptyDescription : "Log the first shift to start building your OT history, approvals, and payment trail."}
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <ListRow
                key={row.id}
                title={showWorkerName ? row.workerName : formatOvertimeDate(row.workedOn)}
                subtitle={
                  showWorkerName
                    ? `${formatOvertimeDate(row.workedOn)} · ${row.startTimeLabel} - ${row.endTimeLabel}`
                    : `${row.startTimeLabel} - ${row.endTimeLabel} ${row.overnight ? "· Overnight" : ""}`
                }
                meta={row.approvedBy || "Awaiting review"}
                badges={
                  <>
                    <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                    <Badge variant={row.paymentStatusVariant === "green" ? "green" : row.paymentStatusVariant === "amber" ? "amber" : "subtle"}>
                      {row.paymentStatusLabel}
                    </Badge>
                    {row.isModifiedApproval ? <Badge variant="amber">Adjusted</Badge> : null}
                  </>
                }
                aside={
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">OT amount</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{row.amountLabel}</p>
                  </div>
                }
                details={
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold text-text-primary">Worked:</span> {row.totalWorkedLabel}
                      {" · "}
                      <span className="font-semibold text-text-primary">OT:</span> {row.overtimeLabel}
                    </p>
                    <p>{row.calculationSummary}</p>
                    {row.notes ? <p><span className="font-semibold text-text-primary">Note:</span> {row.notes}</p> : null}
                    {row.approvalComment ? <p><span className="font-semibold text-text-primary">Comment:</span> {row.approvalComment}</p> : null}
                    {row.wellbeingWarning ? <p className="text-amber-700">Exceeded the 2-hour wellbeing warning threshold.</p> : null}
                  </div>
                }
                actions={
                  showAdminActions && row.status === "pending" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending && pendingApproveId === row.id}
                        onClick={() => {
                          setMessage(null);
                          setPendingApproveId(row.id);
                          startTransition(async () => {
                            const result = await approveOvertimeEntryQuickAction(row.id);
                            setPendingApproveId(null);
                            setMessage({
                              tone: result.status === "success" ? "success" : "error",
                              text: result.message,
                            });
                            router.refresh();
                          });
                        }}
                      >
                        {isPending && pendingApproveId === row.id ? "Approving" : "Approve"}
                      </Button>
                      <OvertimeApprovalSheet entry={row} buttonLabel="Review" />
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
