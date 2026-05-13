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
import { useToast } from "@/components/ui/toaster";
import { formatOvertimeDate, overtimeReviewDecisions, type OvertimeLedgerRow } from "@/lib/overtime";
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
  const toast = useToast();
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
    if (!open) return;
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
            if (error) setError(field as keyof OvertimeReviewValues, { message: error });
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }
      toast({
        title: values.decision === "rejected" ? "Shift rejected" : "Decision saved",
        description: `${entry.workerName} · ${formatOvertimeDate(entry.workedOn)}`,
        tone: values.decision === "rejected" ? "warning" : "success",
      });
      setOpen(false);
      router.refresh();
    });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={ClipboardCheck} tone="mint" size="md" />
                <div className="space-y-1">
                  <SheetTitle>Review shift</SheetTitle>
                  <SheetDescription>Approve, adjust, or reject.</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="mt-4 rounded-xl border border-border bg-surface-muted p-3.5">
              <p className="font-display text-sm font-semibold text-text-primary">{entry.workerName}</p>
              <p className="mt-0.5 text-2xs text-text-muted">{formatOvertimeDate(entry.workedOn)}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-2xs">
                <div className="rounded-lg bg-white px-2.5 py-2">
                  <p className="text-text-muted">Worked</p>
                  <p className="mt-0.5 font-semibold text-text-primary">{entry.totalWorkedLabel}</p>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-2">
                  <p className="text-text-muted">OT</p>
                  <p className="mt-0.5 font-semibold text-text-primary">{entry.overtimeLabel}</p>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-2">
                  <p className="text-text-muted">AED</p>
                  <p className="mt-0.5 font-semibold text-text-primary">{entry.amountLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <form className="flex flex-1 flex-col space-y-5 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            <FormField label="Decision" htmlFor="overtime-review-decision" error={errors.decision?.message}>
              <Select id="overtime-review-decision" {...register("decision")}>
                {overtimeReviewDecisions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormField>

            {decision !== "rejected" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField label="Worked hrs" htmlFor="approved-worked-hours" error={errors.approvedWorkedHours?.message}>
                  <Input id="approved-worked-hours" type="number" step="0.01" min="0" max="24" {...register("approvedWorkedHours")} />
                </FormField>
                <FormField label="OT hrs" htmlFor="approved-overtime-hours" error={errors.approvedOvertimeHours?.message}>
                  <Input id="approved-overtime-hours" type="number" step="0.01" min="0" max="24" {...register("approvedOvertimeHours")} />
                </FormField>
                <FormField label="AED" htmlFor="approved-amount" error={errors.approvedAmount?.message}>
                  <Input id="approved-amount" type="number" step="0.01" min="0" {...register("approvedAmount")} />
                </FormField>
              </div>
            ) : null}

            <FormField
              label={decision === "rejected" ? "Rejection reason" : "Comment"}
              htmlFor="overtime-review-comment"
              optional={decision !== "rejected"}
              error={errors.comment?.message}
            >
              <Textarea
                id="overtime-review-comment"
                className="min-h-[90px]"
                placeholder={decision === "rejected" ? "Tell the worker what needs to be corrected." : "Optional note for the worker."}
                {...register("comment")}
              />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-[2]"
                  variant={decision === "rejected" ? "danger" : "default"}
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : decision === "rejected" ? "Reject" : "Save decision"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
