"use client";

import { useState, useTransition } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Ban, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { voidPettyCashTransactionAction } from "@/app/app/petty-cash/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { formatPettyCashTransactionType, type PettyCashLedgerRow } from "@/lib/petty-cash";

export function PettyCashVoidButton({ transaction }: { transaction: PettyCashLedgerRow }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    setError(null);
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError("Add a brief reason (min 3 characters).");
      return;
    }

    startTransition(async () => {
      try {
        const result = await voidPettyCashTransactionAction(transaction.id, trimmed);
        if (result.status === "error") {
          setError(result.fieldErrors?.reason ?? result.message);
          return;
        }
        toast({ title: "Transaction voided", description: result.message, tone: "success" });
        setOpen(false);
        setReason("");
        router.refresh();
      } catch (caught) {
        console.error("Failed to void petty cash transaction", caught);
        setError(caught instanceof Error ? caught.message : "Couldn't void. Please try again.");
      }
    });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setReason(""); setError(null); } }}>
      <DialogPrimitive.Trigger asChild>
        <Button type="button" variant="outline" size="xs" className="h-7 rounded-full text-2xs text-danger-600 hover:border-danger-200">
          <Ban className="h-3 w-3" />
          Void
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-primary-700/45 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-5 shadow-elevated sm:p-6",
          )}
        >
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-lg p-2 text-text-muted transition hover:bg-surface-muted hover:text-text-primary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <DialogPrimitive.Title className="font-display text-base font-semibold text-text-primary">
                Void this transaction?
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-5 text-text-secondary">
                {formatPettyCashTransactionType(transaction.type)} of <span className="font-semibold tabular-nums">{transaction.amountLabel}</span>.
                The row stays visible for audit but no longer affects the balance.
              </DialogPrimitive.Description>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <FormField label="Reason" htmlFor="void-reason" error={error ?? undefined}>
              <Textarea
                id="void-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Duplicate of earlier entry, vendor refunded, wrong category"
                className="min-h-[80px]"
                maxLength={200}
              />
            </FormField>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={onConfirm} disabled={isPending}>
              {isPending ? "Voiding..." : "Void transaction"}
            </Button>
          </div>
          {error && reason.trim().length >= 3 ? <InlineMessage tone="error" className="mt-3">{error}</InlineMessage> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
