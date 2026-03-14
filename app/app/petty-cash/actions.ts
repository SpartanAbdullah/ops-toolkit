"use server";

import { PettyCashPaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAppContext } from "@/lib/app/session";
import {
  formatPettyCashTransactionType,
  getDefaultPaymentMethod,
  getDerivedReimbursementStatus,
  getDerivedStatus,
  parseDateInputToUtcNoon,
  type PettyCashPaymentMethodValue,
} from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import { pettyCashTransactionSchema, type PettyCashTransactionFormValues } from "@/lib/validation/petty-cash";
import { formatCurrency } from "@/lib/utils";

type ActionResult<TFields extends string = string> = {
  status: "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<TFields, string>>;
};

function getFieldErrors<TFields extends string>(error: z.ZodError) {
  return error.issues.reduce<Partial<Record<TFields, string>>>((accumulator, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !accumulator[field as TFields]) {
      accumulator[field as TFields] = issue.message;
    }
    return accumulator;
  }, {});
}

async function getOrCreatePettyCashAccount(userId: string, teamId: string | null) {
  const existingAccount = await prisma.pettyCashAccount.findUnique({
    where: { userId },
  });

  if (!existingAccount) {
    return prisma.pettyCashAccount.create({
      data: {
        userId,
        teamId,
      },
    });
  }

  if (!existingAccount.teamId && teamId) {
    return prisma.pettyCashAccount.update({
      where: { id: existingAccount.id },
      data: {
        teamId,
      },
    });
  }

  return existingAccount;
}

export async function createPettyCashTransactionAction(
  values: PettyCashTransactionFormValues,
): Promise<ActionResult<keyof PettyCashTransactionFormValues>> {
  const parsed = pettyCashTransactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the transaction details.",
      fieldErrors: getFieldErrors<keyof PettyCashTransactionFormValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  const existingAccount = await prisma.pettyCashAccount.findUnique({
    where: { userId: context.user.id },
    select: {
      id: true,
      teamId: true,
    },
  });

  const openingBalanceTransaction = existingAccount
    ? await prisma.pettyCashTransaction.findFirst({
        where: {
          accountId: existingAccount.id,
          type: "opening_balance",
        },
        select: {
          id: true,
        },
      })
    : null;

  if (!openingBalanceTransaction && parsed.data.type !== "opening_balance") {
    return {
      status: "error",
      message: "Set the opening balance before adding other petty cash movements.",
    };
  }

  if (openingBalanceTransaction && parsed.data.type === "opening_balance") {
    return {
      status: "error",
      message: "An opening balance already exists. Use Cash Top-Up or Adjustment for later changes.",
      fieldErrors: {
        type: "Opening balance can only be set once per ledger.",
      },
    };
  }

  const account = await getOrCreatePettyCashAccount(context.user.id, context.activeTeam?.id ?? null);
  const numericAmount = Number(parsed.data.amount);
  const normalizedAmount = parsed.data.type === "adjustment" ? numericAmount : Math.abs(numericAmount);
  const paymentMethod = (
    parsed.data.paymentMethod || getDefaultPaymentMethod(parsed.data.type)
  ) as PettyCashPaymentMethodValue | null;

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.pettyCashTransaction.create({
      data: {
        accountId: account.id,
        createdByUserId: context.user.id,
        occurredAt: parseDateInputToUtcNoon(parsed.data.occurredAt),
        type: parsed.data.type,
        amount: normalizedAmount,
        category: parsed.data.category.trim(),
        vendorPayee: parsed.data.vendorPayee.trim() || null,
        paymentMethod: paymentMethod ? paymentMethod as PettyCashPaymentMethod : null,
        notes: parsed.data.notes.trim() || null,
        referenceNumber: parsed.data.referenceNumber.trim() || null,
        receiptReference: parsed.data.receiptReference.trim() || null,
        status: getDerivedStatus(parsed.data.type),
        reimbursementStatus: getDerivedReimbursementStatus(parsed.data.type),
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam?.id,
        actorUserId: context.user.id,
        action: "petty_cash.transaction.created",
        entityType: "PettyCashTransaction",
        entityId: transaction.id,
        summary: `Added ${formatPettyCashTransactionType(parsed.data.type)} for ${formatCurrency(Math.abs(normalizedAmount))}.`,
        details: {
          accountId: account.id,
          type: parsed.data.type,
          amount: normalizedAmount,
          category: parsed.data.category.trim(),
        },
      },
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/petty-cash");

  return {
    status: "success",
    message: "Transaction saved.",
  };
}