"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { closePettyCashMonthAction } from "@/app/app/petty-cash/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { calculatePettyCashClosing } from "@/lib/petty-cash";
import { formatCurrency } from "@/lib/utils";
import { pettyCashClosingSchema, type PettyCashClosingFormValues } from "@/lib/validation/petty-cash";

export function PettyCashClosingCard({
  expectedBalance,
  alreadyClosed,
  periodLabel,
}: {
  expectedBalance: number;
  alreadyClosed: boolean;
  periodLabel: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<PettyCashClosingFormValues>({
    resolver: zodResolver(pettyCashClosingSchema),
    defaultValues: {
      countedCash: expectedBalance.toFixed(2),
      financeNote: "",
    },
  });
  const countedCash = Number(watch("countedCash"));
  const closingPreview = calculatePettyCashClosing(expectedBalance, Number.isFinite(countedCash) ? countedCash : expectedBalance);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    if (!window.confirm(`Close ${periodLabel} petty cash? Normal edits for this month will be locked.`)) {
      return;
    }

    startTransition(async () => {
      const result = await closePettyCashMonthAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) setError(field as keyof PettyCashClosingFormValues, { message: error });
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      toast({ title: "Cash month closed", description: result.message, tone: "success" });
      router.refresh();
    });
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-semibold text-text-primary">Month-end cash closing</p>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Count physical cash, record the difference, and lock normal edits for {periodLabel}.
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
        </div>

        {alreadyClosed ? (
          <InlineMessage tone="success">{periodLabel} is already closed and locked.</InlineMessage>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                <p className="text-2xs uppercase tracking-wide text-text-muted">Expected</p>
                <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-text-primary">
                  {formatCurrency(expectedBalance)}
                </p>
              </div>
              <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                <p className="text-2xs uppercase tracking-wide text-text-muted">Difference</p>
                <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-text-primary">
                  {formatCurrency(closingPreview.difference)}
                </p>
              </div>
            </div>
            <FormField label="Counted cash" htmlFor="cash-counted" error={errors.countedCash?.message}>
              <Input id="cash-counted" type="number" step="0.01" min="0" inputMode="decimal" {...register("countedCash")} />
            </FormField>
            <FormField label="Finance note" htmlFor="cash-close-note" optional error={errors.financeNote?.message}>
              <Textarea id="cash-close-note" className="min-h-[80px]" placeholder="Reason for any variance, handover notes, or receipt issues." {...register("financeNote")} />
            </FormField>
            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Closing..." : `Close ${periodLabel}`}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
