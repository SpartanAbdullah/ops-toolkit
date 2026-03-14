"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteArrowDown, BanknoteArrowUp, ClipboardList, CreditCard, HandCoins, ReceiptText, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { createPettyCashTransactionAction } from "@/app/app/petty-cash/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";

const typeIcons: Record<PettyCashTransactionTypeValue, typeof ClipboardList> = {
  opening_balance: BanknoteArrowUp,
  cash_top_up: BanknoteArrowUp,
  expense_cash: BanknoteArrowDown,
  expense_card: CreditCard,
  reimbursement_submitted: ReceiptText,
  reimbursement_received: HandCoins,
  adjustment: Settings2,
};

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDefaultValues(type: PettyCashTransactionTypeValue): PettyCashTransactionFormValues {
  return {
    occurredAt: getTodayInputValue(),
    type,
    amount: "",
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
    default:
      return "Vendor / payee";
  }
}

export function PettyCashTransactionSheet({
  buttonLabel,
  buttonVariant = "default",
  buttonSize = "default",
  categories,
  hasOpeningBalance,
}: {
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  categories: string[];
  hasOpeningBalance: boolean;
}) {
  const router = useRouter();
  const categoryListId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableTypes = useMemo(
    () => pettyCashTransactionTypes.filter((type) => hasOpeningBalance ? type.value !== "opening_balance" : type.value === "opening_balance"),
    [hasOpeningBalance],
  );
  const defaultType = availableTypes[0]?.value ?? "expense_cash";
  const suggestedCategoryRef = useRef<string>(getSuggestedCategory(defaultType));
  const categoryOptions = useMemo(
    () => Array.from(new Set([...pettyCashDefaultCategories, ...categories])).sort((left, right) => left.localeCompare(right)),
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
    defaultValues: buildDefaultValues(defaultType),
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
    if (!open) {
      return;
    }

    const defaults = buildDefaultValues(defaultType);
    suggestedCategoryRef.current = defaults.category;
    reset(defaults);
    setMessage(null);
  }, [defaultType, open, reset]);

  useEffect(() => {
    const suggestedCategory = getSuggestedCategory(selectedType);
    const currentCategory = getValues("category");

    if (!currentCategory || currentCategory === suggestedCategoryRef.current) {
      setValue("category", suggestedCategory, { shouldValidate: true, shouldDirty: false });
    }

    const defaultPaymentMethod = getDefaultPaymentMethod(selectedType);
    setValue("paymentMethod", typeNeedsSelectablePaymentMethod(selectedType) ? (getValues("paymentMethod") || defaultPaymentMethod || "") : (defaultPaymentMethod || ""), {
      shouldValidate: true,
      shouldDirty: false,
    });

    if (!typeShowsReceiptReference(selectedType)) {
      setValue("receiptReference", "", { shouldValidate: true, shouldDirty: false });
    }

    suggestedCategoryRef.current = suggestedCategory;
  }, [getValues, selectedType, setValue]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await createPettyCashTransactionAction(values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              setError(field as keyof PettyCashTransactionFormValues, { message: error });
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
      <SheetContent className="max-w-[96vw] overflow-y-auto border-l border-white/80 p-0 sm:max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-6 py-6 backdrop-blur">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconTile icon={SelectedTypeIcon} tone={previewImpact < 0 ? "red" : previewImpact > 0 ? "green" : "blue"} size="lg" />
              <div className="space-y-2">
                <SheetTitle>{hasOpeningBalance ? "Add petty cash transaction" : "Set opening balance"}</SheetTitle>
                <SheetDescription>{selectedTypeMeta.description}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        <div className="space-y-8 px-6 py-6">
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/85 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Cash impact preview</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{formatCashImpact(previewImpact)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedTypeMeta.description}</p>
              </div>
              <div className="rounded-full border border-white/90 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                {selectedTypeMeta.label}
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              {hasOpeningBalance ? (
                <FormField label="Transaction type" htmlFor="petty-cash-type" hint="Choose the movement you want to add.">
                  <select id="petty-cash-type" className={selectClasses} {...register("type")}>
                    {availableTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <div className="space-y-3 rounded-[1.3rem] border border-sky-100 bg-sky-50/70 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Opening Balance</p>
                  <p className="text-sm leading-6 text-slate-600">The ledger starts with a single opening balance entry. Future cash changes can then use Top-Up or Adjustment.</p>
                </div>
              )}
              <FormField label="Date" htmlFor="petty-cash-date" error={errors.occurredAt?.message}>
                <Input id="petty-cash-date" type="date" {...register("occurredAt")} />
              </FormField>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label={selectedType === "adjustment" ? "Adjustment amount" : "Amount"}
                htmlFor="petty-cash-amount"
                hint={selectedType === "adjustment" ? "Use a positive amount to increase cash or a negative amount to reduce it." : "Enter the movement amount in AED."}
                error={errors.amount?.message}
              >
                <Input id="petty-cash-amount" type="number" step="0.01" placeholder={selectedType === "adjustment" ? "e.g. -25 or 25" : "e.g. 120"} {...register("amount")} />
              </FormField>
              <FormField label="Category" htmlFor="petty-cash-category" hint="Use a clear category so the ledger stays browsable later." error={errors.category?.message}>
                <>
                  <Input id="petty-cash-category" list={categoryListId} type="text" placeholder="e.g. Office supplies" {...register("category")} />
                  <datalist id={categoryListId}>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </>
              </FormField>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label={getVendorLabel(selectedType)} htmlFor="petty-cash-vendor" hint="Optional, but useful when reviewing vendor and reimbursement patterns later." error={errors.vendorPayee?.message}>
                <Input id="petty-cash-vendor" type="text" placeholder="Supplier, staff member, bank, or claimant" {...register("vendorPayee")} />
              </FormField>
              {typeNeedsSelectablePaymentMethod(selectedType) ? (
                <FormField label="Payment method" htmlFor="petty-cash-payment-method" hint="How the money moved into the fund or back to the operator." error={errors.paymentMethod?.message}>
                  <select id="petty-cash-payment-method" className={selectClasses} {...register("paymentMethod")}>
                    <option value="">Select payment method</option>
                    {pettyCashPaymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <div className="space-y-3 rounded-[1.3rem] border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Payment method</p>
                  <p className="text-sm leading-6 text-slate-600">{getDefaultPaymentMethod(selectedType) ? `Recorded as ${getDefaultPaymentMethod(selectedType)?.replace("_", " ")}.` : "No separate payment method is needed for this transaction type."}</p>
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Reference number" htmlFor="petty-cash-reference" hint="Optional bank ref, voucher number, claim ID, or internal sequence." error={errors.referenceNumber?.message}>
                <Input id="petty-cash-reference" type="text" placeholder="e.g. PC-2026-014" {...register("referenceNumber")} />
              </FormField>
              {typeShowsReceiptReference(selectedType) ? (
                <FormField label="Receipt reference" htmlFor="petty-cash-receipt" hint="Optional receipt number or scan reference for later reconciliation." error={errors.receiptReference?.message}>
                  <Input id="petty-cash-receipt" type="text" placeholder="e.g. RECEIPT-8821" {...register("receiptReference")} />
                </FormField>
              ) : (
                <div className="space-y-3 rounded-[1.3rem] border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Receipt reference</p>
                  <p className="text-sm leading-6 text-slate-600">Receipt references are mainly useful for expense and reimbursement rows where supporting evidence may matter later.</p>
                </div>
              )}
            </div>

            <FormField label="Notes" htmlFor="petty-cash-notes" hint="Use notes for context that will help later reconciliation or review." error={errors.notes?.message}>
              <Textarea id="petty-cash-notes" placeholder="What happened, why it was needed, or any detail useful for later review." {...register("notes")} />
            </FormField>

            {message ? (
              <div className={message.tone === "success" ? "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700" : "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700"}>
                {message.text}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Saving transaction" : hasOpeningBalance ? "Save transaction" : "Set opening balance"}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}