"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { reviewOvertimeEntryAction } from "@/app/app/overtime/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { overtimeReviewDecisions, type OvertimeLedgerRow } from "@/lib/overtime";
import { overtimeReviewSchema, type OvertimeReviewValues } from "@/lib/validation/overtime";

function buildDefaultValues(entry: OvertimeLedgerRow): OvertimeReviewValues {
  return {
    decision: "approved",
    approvedWorkedHours: (entry.totalWorkedMinutes / 60).toFixed(2),
    approvedOvertimeHours: (entry.overtimeMinutes / 60).toFixed(2),
    approvedAmount: entry.amount.toFixed(2),
    comment: "",
  };
}

export function OvertimeApprovalSheet({
  entry,
  buttonLabel,
  buttonVariant = "secondary",
  buttonSize = "sm",
}: {
  entry: OvertimeLedgerRow;
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<OvertimeReviewValues>({
    resolver: zodResolver(overtimeReviewSchema),
    defaultValues: buildDefaultValues(entry),
  });

  const decision = watch("decision");

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(buildDefaultValues(entry));
    setMessage(null);
  }, [entry, open, reset]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await reviewOvertimeEntryAction(entry.id, values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              setError(field as keyof OvertimeReviewValues, { message: error });
            }
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      setOpen(false);
      router.refresh();
    });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="max-w-[96vw] overflow-y-auto p-0 sm:max-w-xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-6 py-6 backdrop-blur">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconTile icon={ClipboardCheck} tone="green" size="lg" />
              <div className="space-y-2">
                <SheetTitle>Review overtime entry</SheetTitle>
                <SheetDescription>Approve as-is, adjust the approved values, or reject with a clear comment for the worker.</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-950">{entry.workerName}</p>
            <p className="mt-1 text-sm text-slate-500">{entry.workedOn}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-white/90 bg-white px-3 py-3 text-sm shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Worked</p>
                <p className="mt-2 font-semibold text-slate-900">{entry.totalWorkedLabel}</p>
              </div>
              <div className="rounded-[1rem] border border-white/90 bg-white px-3 py-3 text-sm shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">OT</p>
                <p className="mt-2 font-semibold text-slate-900">{entry.overtimeLabel}</p>
              </div>
              <div className="rounded-[1rem] border border-white/90 bg-white px-3 py-3 text-sm shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AED</p>
                <p className="mt-2 font-semibold text-slate-900">{entry.amountLabel}</p>
              </div>
            </div>
          </div>

          <form className="space-y-6 pb-2" onSubmit={onSubmit}>
            <FormField label="Decision" htmlFor="overtime-review-decision" error={errors.decision?.message}>
              <Select id="overtime-review-decision" {...register("decision")}>
                {overtimeReviewDecisions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormField>

            {decision !== "rejected" ? (
              <div className="grid gap-5 md:grid-cols-3">
                <FormField label="Approved worked hours" htmlFor="approved-worked-hours" error={errors.approvedWorkedHours?.message}>
                  <Input id="approved-worked-hours" type="number" step="0.01" min="0" max="24" {...register("approvedWorkedHours")} />
                </FormField>
                <FormField label="Approved OT hours" htmlFor="approved-overtime-hours" error={errors.approvedOvertimeHours?.message}>
                  <Input id="approved-overtime-hours" type="number" step="0.01" min="0" max="24" {...register("approvedOvertimeHours")} />
                </FormField>
                <FormField label="Approved AED" htmlFor="approved-amount" error={errors.approvedAmount?.message}>
                  <Input id="approved-amount" type="number" step="0.01" min="0" {...register("approvedAmount")} />
                </FormField>
              </div>
            ) : null}

            <FormField label={decision === "rejected" ? "Rejection comment" : "Comment"} htmlFor="overtime-review-comment" hint={decision === "rejected" ? "Workers should understand why the entry was rejected." : "Optional comment for the worker or payroll trail."} error={errors.comment?.message}>
              <Textarea id="overtime-review-comment" className="min-h-[110px]" placeholder={decision === "rejected" ? "Explain what needs correction before resubmission." : "Optional note about any adjusted values or context."} {...register("comment")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">
                  {decision === "rejected" ? "Rejections should clearly explain what needs correction." : "Save approved values once payroll-facing numbers look correct."}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button type="submit" size="lg" variant={decision === "rejected" ? "danger" : "default"} disabled={isPending}>
                    {isPending ? "Saving review" : decision === "rejected" ? "Reject entry" : "Save decision"}
                  </Button>
                  <Button type="button" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
