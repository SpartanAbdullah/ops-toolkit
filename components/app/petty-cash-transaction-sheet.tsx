"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, BanknoteArrowDown, BanknoteArrowUp, ClipboardList, CreditCard, HandCoins, Plus, ReceiptText, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { createPettyCashTransactionAction } from "@/app/app/petty-cash/actions";
import { usePettyCashPending } from "@/components/app/petty-cash-pending-provider";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  formatCashImpact,
  getCashImpact,
  getDefaultPaymentMethod,
  getSuggestedCategory,
  pettyCashDefaultCategories,
  pettyCashPaymentMethods,
  pettyCashTransactionTypeMeta,
  pettyCashTransactionTypes,
  typeNeedsSelectablePaymentMethod,
  typeShowsReceiptReference,
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

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDefaultValues(
  type: PettyCashTransactionTypeValue,
  prefilledAmount?: string,
): PettyCashTransactionFormValues {
  return {
    occurredAt: getTodayInputValue(),
    type,
    amount: prefilledAmount ?? "",
    category: getSuggestedCategory(type),
    vendorPayee: "",
    paymentMethod: getDefaultPaymentMethod(type) ?? "",
    notes: "",
    referenceNumber: "",
    receiptReference: "",
  };
}

function getVendorLabel(type: PettyCashTransactionTypeValue) {
  switch (type) {
    case "cash_top_up":
      return "Source / payee";
    case "reimbursement_submitted":
      return "Submitted to";
    case "reimbursement_received":
      return "Received from";
    case "card_settlement":
      return "Card / institution";
    default:
      return "Vendor / payee";
  }
}

export function PettyCashTransactionSheet({
  buttonLabel,
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName,
  buttonIcon = false,
  categories,
  hasOpeningBalance,
  initialType,
  prefilledAmount,
}: {
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  buttonClassName?: string;
  buttonIcon?: boolean;
  categories: string[];
  hasOpeningBalance: boolean;
  initialType?: PettyCashTransactionTypeValue;
  prefilledAmount?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryListId = useId();
  const pending = usePettyCashPending();
  const toast = useToast();
  const skipNextResetRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableTypes = useMemo(
    () =>
      pettyCashTransactionTypes.filter((type) =>
        hasOpeningBalance ? type.value !== "opening_balance" : type.value === "opening_balance",
      ),
    [hasOpeningBalance],
  );
  const defaultType = useMemo(() => {
    if (initialType && availableTypes.some((t) => t.value === initialType)) return initialType;
    return availableTypes[0]?.value ?? "expense_cash";
  }, [availableTypes, initialType]);
  const suggestedCategoryRef = useRef<string>(getSuggestedCategory(defaultType));
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
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<PettyCashTransactionFormValues>({
    resolver: zodResolver(pettyCashTransactionSchema),
    defaultValues: buildDefaultValues(defaultType, prefilledAmount),
  });

  const selectedType = watch("type");
  const amountValue = watch("amount");
  const selectedTypeMeta = pettyCashTransactionTypeMeta[selectedType];
  const SelectedTypeIcon = typeIcons[selectedType];
  const previewAmount = Number(amountValue);
  const previewImpact = Number.isFinite(previewAmount)
    ? getCashImpact(selectedType, selectedType === "adjustment" ? previewAmount : Math.abs(previewAmount))
    : 0;

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`/app/petty-cash${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!open) return;
    if (skipNextResetRef.current) {
      // Re-opened after an error — keep the form values so the user doesn't lose their work
      skipNextResetRef.current = false;
      return;
    }
    const defaults = buildDefaultValues(defaultType, prefilledAmount);
    suggestedCategoryRef.current = defaults.category;
    reset(defaults);
    setMessage(null);
  }, [defaultType, prefilledAmount, open, reset]);

  useEffect(() => {
    const suggestedCategory = getSuggestedCategory(selectedType);
    const currentCategory = getValues("category");
    if (!currentCategory || currentCategory === suggestedCategoryRef.current) {
      setValue("category", suggestedCategory, { shouldValidate: true, shouldDirty: false });
    }
    const defaultPaymentMethod = getDefaultPaymentMethod(selectedType);
    setValue(
      "paymentMethod",
      typeNeedsSelectablePaymentMethod(selectedType) ? getValues("paymentMethod") || defaultPaymentMethod || "" : defaultPaymentMethod || "",
      { shouldValidate: true, shouldDirty: false },
    );
    if (!typeShowsReceiptReference(selectedType)) {
      setValue("receiptReference", "", { shouldValidate: true, shouldDirty: false });
    }
    suggestedCategoryRef.current = suggestedCategory;
  }, [getValues, selectedType, setValue]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    // Capture the optimistic snapshot before the transition starts
    const numeric = Number(values.amount);
    const optimisticAmount = Number.isFinite(numeric)
      ? values.type === "adjustment"
        ? numeric
        : Math.abs(numeric)
      : 0;
    const optimisticRow = pending
      ? {
          tempId: `temp-${Date.now()}`,
          type: values.type,
          typeLabel: pettyCashTransactionTypeMeta[values.type].label,
          category: values.category.trim() || pettyCashTransactionTypeMeta[values.type].defaultCategory,
          amount: optimisticAmount,
          occurredAt: values.occurredAt,
        }
      : null;

    // Close the sheet immediately for snappy feedback. Optimistic row + transition show progress.
    setOpen(false);

    startTransition(async () => {
      if (optimisticRow && pending) {
        pending.addPending(optimisticRow);
      }
      const result = await createPettyCashTransactionAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) setError(field as keyof PettyCashTransactionFormValues, { message: error });
          });
        }
        setMessage({ tone: "error", text: result.message });
        skipNextResetRef.current = true;
        setOpen(true);
        return;
      }
      toast({
        title: pettyCashTransactionTypeMeta[values.type].label + " saved",
        description: result.message,
        tone: "success",
      });
      reset(buildDefaultValues(defaultType, prefilledAmount));
      router.refresh();
    });
  });

  const impactTone = previewImpact > 0 ? "mint" : previewImpact < 0 ? "rose" : "navy";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
          {buttonIcon ? <Plus className="h-4 w-4" /> : null}
          {buttonLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={SelectedTypeIcon} tone={impactTone} size="md" />
                <div className="space-y-1">
                  <SheetTitle>{hasOpeningBalance ? "Add transaction" : "Set opening balance"}</SheetTitle>
                  <SheetDescription>{selectedTypeMeta.description}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-2xs uppercase tracking-wide text-text-muted">Cash impact preview</p>
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
              {selectedType === "reimbursement_submitted" ? (
                <p className="rounded-lg bg-accent-50 px-3 py-2 text-2xs leading-4 text-accent-foreground">
                  This records the claim filed with accounts — no money has moved yet. Log it as <span className="font-semibold">Reimbursement Received</span> when the float is replenished.
                </p>
              ) : selectedType === "expense_card" ? (
                <p className="rounded-lg bg-primary-50 px-3 py-2 text-2xs leading-4 text-primary-700">
                  Cash on hand is untouched, but this adds to <span className="font-semibold">Card outstanding</span>. Log a <span className="font-semibold">Card Settlement</span> when the card balance is paid off.
                </p>
              ) : selectedType === "card_settlement" ? (
                <p className="rounded-lg bg-mint-50 px-3 py-2 text-2xs leading-4 text-mint-600">
                  Reduces <span className="font-semibold">Card outstanding</span> by this amount. Use when you've paid the card from personal bank, a reimbursement, or any source other than petty cash.
                </p>
              ) : null}
            </div>
          </div>

          <form className="flex flex-1 flex-col space-y-4 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            {hasOpeningBalance ? (
              <FormField label="Transaction type" htmlFor="petty-cash-type">
                <Select id="petty-cash-type" {...register("type")}>
                  {availableTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </FormField>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={selectedType === "adjustment" ? "Adjustment amount" : "Amount (AED)"}
                htmlFor="petty-cash-amount"
                hint={selectedType === "adjustment" ? "Positive or negative." : undefined}
                error={errors.amount?.message}
              >
                <Input
                  id="petty-cash-amount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder={selectedType === "adjustment" ? "e.g. -25" : "e.g. 120"}
                  {...register("amount")}
                />
              </FormField>
              <FormField label="Date" htmlFor="petty-cash-date" error={errors.occurredAt?.message}>
                <Input id="petty-cash-date" type="date" {...register("occurredAt")} />
              </FormField>
            </div>

            <FormField label="Category" htmlFor="petty-cash-category" error={errors.category?.message}>
              <Input id="petty-cash-category" list={categoryListId} type="text" placeholder="e.g. Office supplies" {...register("category")} />
              <datalist id={categoryListId}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </FormField>

            <FormField
              label={getVendorLabel(selectedType)}
              htmlFor="petty-cash-vendor"
              optional
              error={errors.vendorPayee?.message}
            >
              <Input id="petty-cash-vendor" type="text" placeholder="Supplier, staff, etc." {...register("vendorPayee")} />
            </FormField>

            {typeNeedsSelectablePaymentMethod(selectedType) ? (
              <FormField label="Payment method" htmlFor="petty-cash-payment-method" error={errors.paymentMethod?.message}>
                <Select id="petty-cash-payment-method" {...register("paymentMethod")}>
                  <option value="">Select method</option>
                  {pettyCashPaymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </Select>
              </FormField>
            ) : null}

            <details className="surface-card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-semibold text-text-primary marker:hidden">
                <span>Reference & receipt</span>
                <span className="text-2xs uppercase tracking-wide text-text-muted">Optional</span>
              </summary>
              <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
                <FormField label="Reference" htmlFor="petty-cash-reference" optional error={errors.referenceNumber?.message}>
                  <Input id="petty-cash-reference" type="text" placeholder="e.g. PC-2026-014" {...register("referenceNumber")} />
                </FormField>
                {typeShowsReceiptReference(selectedType) ? (
                  <FormField label="Receipt #" htmlFor="petty-cash-receipt" optional error={errors.receiptReference?.message}>
                    <Input id="petty-cash-receipt" type="text" placeholder="e.g. R-8821" {...register("receiptReference")} />
                  </FormField>
                ) : null}
              </div>
            </details>

            <FormField label="Notes" htmlFor="petty-cash-notes" optional error={errors.notes?.message}>
              <Textarea id="petty-cash-notes" className="min-h-[80px]" placeholder="Context for later review" {...register("notes")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2]" disabled={isPending}>
                  {isPending ? "Saving..." : hasOpeningBalance ? "Save transaction" : "Set opening balance"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
