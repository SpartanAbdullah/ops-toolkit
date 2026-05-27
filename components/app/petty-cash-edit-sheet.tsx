"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, BanknoteArrowDown, BanknoteArrowUp, ClipboardList, CreditCard, HandCoins, Pencil, ReceiptText, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { updatePettyCashTransactionAction } from "@/app/app/petty-cash/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
  formatCashImpact,
  getCashImpact,
  getDefaultPaymentMethod,
  pettyCashDefaultCategories,
  pettyCashPaymentMethods,
  pettyCashTransactionTypeMeta,
  typeNeedsSelectablePaymentMethod,
  typeShowsReceiptReference,
  type PettyCashLedgerRow,
  type PettyCashTransactionTypeValue,
} from "@/lib/petty-cash";
import { pettyCashTransactionSchema, type PettyCashTransactionFormValues } from "@/lib/validation/petty-cash";

const typeIcons: Record<PettyCashTransactionTypeValue, typeof ClipboardList> = {
  opening_balance: BanknoteArrowUp,
  cash_top_up: BanknoteArrowUp,
  expense_cash: BanknoteArrowDown,
  expense_card: CreditCard,
  reimbursement_submitted: ReceiptText,
  reimbursement_received: HandCoins,
  adjustment: Settings2,
  card_settlement: BadgeCheck,
};

function buildEditDefaults(row: PettyCashLedgerRow): PettyCashTransactionFormValues {
  return {
    occurredAt: row.occurredOn,
    type: row.type,
    amount: row.type === "adjustment" ? `${row.amount}` : `${Math.abs(row.amount)}`,
    category: row.category,
    vendorPayee: row.vendorPayee ?? "",
    paymentMethod: row.paymentMethod ?? "",
    notes: row.notes ?? "",
    referenceNumber: row.referenceNumber ?? "",
    receiptReference: row.receiptReference ?? "",
  };
}

export function PettyCashEditSheet({
  transaction,
  categories,
}: {
  transaction: PettyCashLedgerRow;
  categories: string[];
}) {
  const router = useRouter();
  const categoryListId = useId();
  const toast = useToast();
  const skipNextResetRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set([...pettyCashDefaultCategories, ...categories])).sort((left, right) => left.localeCompare(right)),
    [categories],
  );

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PettyCashTransactionFormValues>({
    resolver: zodResolver(pettyCashTransactionSchema),
    defaultValues: buildEditDefaults(transaction),
  });

  const amountValue = watch("amount");
  const selectedTypeMeta = pettyCashTransactionTypeMeta[transaction.type];
  const SelectedTypeIcon = typeIcons[transaction.type];
  const previewAmount = Number(amountValue);
  const previewImpact = Number.isFinite(previewAmount)
    ? getCashImpact(transaction.type, transaction.type === "adjustment" ? previewAmount : Math.abs(previewAmount))
    : 0;

  useEffect(() => {
    if (!open) return;
    if (skipNextResetRef.current) {
      skipNextResetRef.current = false;
      return;
    }
    reset(buildEditDefaults(transaction));
    setMessage(null);
  }, [open, reset, transaction]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    if (!window.confirm(`Save changes to this cash record? The audit trail will keep the before and after values.`)) {
      return;
    }
    setOpen(false);

    startTransition(async () => {
      try {
        const result = await updatePettyCashTransactionAction(transaction.id, values);
        if (result.status === "error") {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, error]) => {
              if (error) setError(field as keyof PettyCashTransactionFormValues, { message: error });
            });
          }
          setMessage({ tone: "error", text: result.message });
          toast({ title: "Couldn't save changes", description: result.message, tone: "error" });
          skipNextResetRef.current = true;
          setOpen(true);
          return;
        }
        toast({ title: "Transaction updated", description: result.message, tone: "success" });
        router.refresh();
      } catch (error) {
        console.error("Failed to update petty cash transaction", error);
        const text = error instanceof Error ? error.message : "Something went wrong on the server. Please try again.";
        setMessage({ tone: "error", text });
        toast({ title: "Couldn't save changes", description: text, tone: "error" });
        skipNextResetRef.current = true;
        setOpen(true);
      }
    });
  });

  const impactTone = previewImpact > 0 ? "mint" : previewImpact < 0 ? "rose" : "navy";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="xs" className="h-7 rounded-full text-2xs">
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={SelectedTypeIcon} tone={impactTone} size="md" />
                <div className="space-y-1">
                  <SheetTitle>Edit {selectedTypeMeta.label.toLowerCase()}</SheetTitle>
                  <SheetDescription>{selectedTypeMeta.description}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-2xs uppercase tracking-wide text-text-muted">New cash impact</p>
                  <p className={cn("mt-0.5 font-display text-lg font-semibold tabular-nums",
                    previewImpact > 0 && "text-mint-600",
                    previewImpact < 0 && "text-danger-600",
                    previewImpact === 0 && "text-text-secondary",
                  )}>
                    {formatCashImpact(previewImpact)}
                  </p>
                </div>
                <Badge variant="subtle">{selectedTypeMeta.label}</Badge>
              </div>
              <p className="rounded-lg bg-surface-muted px-3 py-2 text-2xs leading-4 text-text-muted">
                Type can&apos;t be changed after creation. To change the type, void this entry and add a new one.
              </p>
            </div>
          </div>

          <form className="flex flex-1 flex-col space-y-4 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            <input type="hidden" {...register("type")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={transaction.type === "adjustment" ? "Adjustment amount" : "Amount (AED)"}
                htmlFor="petty-cash-edit-amount"
                hint={transaction.type === "adjustment" ? "Positive or negative." : undefined}
                error={errors.amount?.message}
              >
                <Input
                  id="petty-cash-edit-amount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register("amount")}
                />
              </FormField>
              <FormField label="Date" htmlFor="petty-cash-edit-date" error={errors.occurredAt?.message}>
                <Input id="petty-cash-edit-date" type="date" {...register("occurredAt")} />
              </FormField>
            </div>

            <FormField label="Category" htmlFor="petty-cash-edit-category" error={errors.category?.message}>
              <Input id="petty-cash-edit-category" list={categoryListId} type="text" {...register("category")} />
              <datalist id={categoryListId}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Vendor / payee" htmlFor="petty-cash-edit-vendor" optional error={errors.vendorPayee?.message}>
              <Input id="petty-cash-edit-vendor" type="text" {...register("vendorPayee")} />
            </FormField>

            {typeNeedsSelectablePaymentMethod(transaction.type) ? (
              <FormField label="Payment method" htmlFor="petty-cash-edit-payment-method" error={errors.paymentMethod?.message}>
                <Select id="petty-cash-edit-payment-method" {...register("paymentMethod")}>
                  <option value="">Select method</option>
                  {pettyCashPaymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </Select>
              </FormField>
            ) : (
              <input type="hidden" {...register("paymentMethod")} value={getDefaultPaymentMethod(transaction.type) ?? ""} />
            )}

            <details className="surface-card group" open={Boolean(transaction.referenceNumber || transaction.receiptReference)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-semibold text-text-primary marker:hidden">
                <span>Reference & receipt</span>
                <span className="text-2xs uppercase tracking-wide text-text-muted">Optional</span>
              </summary>
              <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
                <FormField label="Reference" htmlFor="petty-cash-edit-reference" optional error={errors.referenceNumber?.message}>
                  <Input id="petty-cash-edit-reference" type="text" {...register("referenceNumber")} />
                </FormField>
                {typeShowsReceiptReference(transaction.type) ? (
                  <FormField label="Receipt #" htmlFor="petty-cash-edit-receipt" optional error={errors.receiptReference?.message}>
                    <Input id="petty-cash-edit-receipt" type="text" {...register("receiptReference")} />
                  </FormField>
                ) : null}
              </div>
            </details>

            <FormField label="Notes" htmlFor="petty-cash-edit-notes" optional error={errors.notes?.message}>
              <Textarea id="petty-cash-edit-notes" className="min-h-[80px]" {...register("notes")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2]" disabled={isPending}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
