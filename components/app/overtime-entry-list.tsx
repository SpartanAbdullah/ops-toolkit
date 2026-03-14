"use client";

import { useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

import { approveOvertimeEntryQuickAction } from "@/app/app/overtime/actions";
import { OvertimeApprovalSheet } from "@/components/app/overtime-approval-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOvertimeDate, type OvertimeLedgerRow } from "@/lib/overtime";

const feedbackClasses = {
  success: "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700",
  error: "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700",
} as const;

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
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl">Overtime ledger</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">Review total worked hours, approved overtime, pay status, and any notes or comments attached to each shift entry.</p>
          </div>
          <div className="rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {rows.length} visible {rows.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}
        {!rows.length ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-500 shadow-sm">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="mt-5 font-display text-2xl font-semibold text-slate-900">
              {hasAnyRows ? emptyTitle : "No overtime entries yet"}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              {hasAnyRows && filtersActive ? emptyDescription : "Log the first overtime shift to start building the saved history, approval flow, and payment trail."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-4 py-2">Date</th>
                    {showWorkerName ? <th className="px-4 py-2">Worker</th> : null}
                    <th className="px-4 py-2">Shift</th>
                    <th className="px-4 py-2">Worked / OT</th>
                    <th className="px-4 py-2">AED</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Payment</th>
                    <th className="px-4 py-2">Notes / comments</th>
                    {showAdminActions ? <th className="px-4 py-2 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 shadow-sm">
                      <td className="rounded-l-[1.4rem] px-4 py-4 align-top text-sm font-medium text-slate-900">{formatOvertimeDate(row.workedOn)}</td>
                      {showWorkerName ? <td className="px-4 py-4 align-top text-sm text-slate-700">{row.workerName}</td> : null}
                      <td className="px-4 py-4 align-top text-sm text-slate-700">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{row.startTimeLabel} - {row.endTimeLabel}</p>
                          <p className="text-xs text-slate-500">{row.overnight ? "Overnight shift" : "Same-day shift"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-700">
                        <div className="space-y-1">
                          <p><span className="font-semibold text-slate-900">Worked:</span> {row.totalWorkedLabel}</p>
                          <p><span className="font-semibold text-slate-900">OT:</span> {row.overtimeLabel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">{row.amountLabel}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-2">
                          <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                          {row.isModifiedApproval ? <Badge variant="amber">Adjusted</Badge> : null}
                          {row.approvedBy ? <p className="text-xs text-slate-500">{row.approvedBy}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={row.paymentStatusVariant}>{row.paymentStatusLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        <div className="space-y-1.5">
                          <p>{row.calculationSummary}</p>
                          {row.notes ? <p><span className="font-semibold text-slate-700">Note:</span> {row.notes}</p> : null}
                          {row.approvalComment ? <p><span className="font-semibold text-slate-700">Comment:</span> {row.approvalComment}</p> : null}
                          {row.wellbeingWarning ? <p className="text-amber-700">Exceeded the 2-hour wellbeing warning threshold.</p> : null}
                        </div>
                      </td>
                      {showAdminActions ? (
                        <td className="rounded-r-[1.4rem] px-4 py-4 align-top text-right">
                          {row.status === "pending" ? (
                            <div className="flex justify-end gap-2">
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
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No action</span>
                          )}
                        </td>
                      ) : null}
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
                        {showWorkerName ? <p className="text-sm font-semibold text-slate-900">{row.workerName}</p> : null}
                        <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                        {row.isModifiedApproval ? <Badge variant="amber">Adjusted</Badge> : null}
                      </div>
                      <p className="text-sm text-slate-500">{formatOvertimeDate(row.workedOn)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/90 bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">OT AED</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{row.amountLabel}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Shift</p>
                      <p className="text-sm text-slate-700">{row.startTimeLabel} - {row.endTimeLabel}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Worked / OT</p>
                      <p className="text-sm text-slate-700">{row.totalWorkedLabel} / {row.overtimeLabel}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payment</p>
                      <Badge variant={row.paymentStatusVariant}>{row.paymentStatusLabel}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Approved by</p>
                      <p className="text-sm text-slate-700">{row.approvedBy || "Not decided yet"}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.3rem] border border-white/90 bg-white/90 px-4 py-4 text-sm leading-6 text-slate-600 shadow-sm">
                    <p>{row.calculationSummary}</p>
                    {row.notes ? <p className="mt-2"><span className="font-semibold text-slate-700">Note:</span> {row.notes}</p> : null}
                    {row.approvalComment ? <p className="mt-2"><span className="font-semibold text-slate-700">Comment:</span> {row.approvalComment}</p> : null}
                    {row.wellbeingWarning ? <p className="mt-2 text-amber-700">Exceeded the 2-hour wellbeing warning threshold.</p> : null}
                  </div>
                  {showAdminActions && row.status === "pending" ? (
                    <div className="mt-5 flex flex-wrap gap-3">
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
                      <OvertimeApprovalSheet entry={row} buttonLabel="Review" buttonSize="sm" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}