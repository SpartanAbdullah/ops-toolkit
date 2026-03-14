import { z } from "zod";

import {
  pettyCashPaymentMethods,
  pettyCashTransactionTypes,
  typeNeedsSelectablePaymentMethod,
  typeShowsReceiptReference,
} from "@/lib/petty-cash";

const transactionTypeValues = pettyCashTransactionTypes.map((option) => option.value) as [
  (typeof pettyCashTransactionTypes)[number]["value"],
  ...Array<(typeof pettyCashTransactionTypes)[number]["value"]>,
];

const paymentMethodValues = pettyCashPaymentMethods.map((option) => option.value) as [
  (typeof pettyCashPaymentMethods)[number]["value"],
  ...Array<(typeof pettyCashPaymentMethods)[number]["value"]>,
];

export const pettyCashTransactionSchema = z
  .object({
    occurredAt: z.string().trim().min(1, "Choose the transaction date."),
    type: z.enum(transactionTypeValues),
    amount: z.string().trim().min(1, "Enter the amount."),
    category: z.string().trim().min(2, "Enter a category.").max(60, "Keep the category under 60 characters."),
    vendorPayee: z.string().trim().max(80, "Keep the vendor or payee under 80 characters.").or(z.literal("")),
    paymentMethod: z.union([z.enum(paymentMethodValues), z.literal("")]),
    notes: z.string().trim().max(500, "Keep the notes under 500 characters.").or(z.literal("")),
    referenceNumber: z.string().trim().max(40, "Keep the reference number under 40 characters.").or(z.literal("")),
    receiptReference: z.string().trim().max(60, "Keep the receipt reference under 60 characters.").or(z.literal("")),
  })
  .superRefine((values, context) => {
    const parsedDate = new Date(`${values.occurredAt}T12:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["occurredAt"],
        message: "Choose a valid transaction date.",
      });
    }

    const numericAmount = Number(values.amount);
    if (!Number.isFinite(numericAmount)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Enter a valid amount.",
      });
    } else if (values.type === "adjustment") {
      if (numericAmount === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Adjustment amount cannot be zero.",
        });
      }
    } else if (numericAmount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount must be greater than zero.",
      });
    }

    if (typeNeedsSelectablePaymentMethod(values.type) && !values.paymentMethod) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentMethod"],
        message: "Select how this movement was received.",
      });
    }

    if (!typeShowsReceiptReference(values.type) && values.receiptReference) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["receiptReference"],
        message: "Receipt references are only used for expenses and reimbursements.",
      });
    }
  });

export type PettyCashTransactionFormValues = z.infer<typeof pettyCashTransactionSchema>;