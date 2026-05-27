"use server";

import { PettyCashPaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManagePettyCashLedger } from "@/lib/app/authorization";
import { getAppContext } from "@/lib/app/session";
import { findOperationalPeriodLock, formatOperationalPeriod, getOperationalPeriodMonth } from "@/lib/app/period-locks";
import {
  buildRunningLedgerRows,
  calculatePettyCashClosing,
  calculatePettyCashSummary,
  formatPettyCashTransactionType,
  getDefaultPaymentMethod,
  getDerivedReimbursementStatus,
  getDerivedStatus,
  parseDateInputToUtcNoon,
  type PettyCashPaymentMethodValue,
} from "@/lib/petty-cash";
import { prisma } from "@/lib/prisma";
import {
  pettyCashClosingSchema,
  pettyCashTransactionSchema,
  type PettyCashClosingFormValues,
  type PettyCashTransactionFormValues,
} from "@/lib/validation/petty-cash";
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

async function getOrCreateCashLedger(userId: string, teamId: string) {
  const existingLedger = await prisma.cashLedger.findFirst({
    where: { teamId },
  });

  if (!existingLedger) {
    return prisma.cashLedger.create({
      data: {
        userId,
        teamId,
        custodianUserId: userId,
      },
    });
  }

  return existingLedger;
}

function ensurePettyCashAccess(context: Awaited<ReturnType<typeof getAppContext>>) {
  if (!context.activeTeam || !context.activeMembership) {
    return "Petty cash records require an active team workspace.";
  }

  if (!canManagePettyCashLedger(context.activeMembership.role)) {
    return "Only owners, admins, and finance can manage petty cash records.";
  }

  return null;
}

async function getPeriodLockMessage(teamId: string, occurredAt: Date) {
  const lock = await findOperationalPeriodLock(prisma, teamId, "petty_cash", occurredAt);
  if (!lock) {
    return null;
  }

  return `${formatOperationalPeriod(occurredAt)} is locked for petty cash. Use the admin correction flow instead of editing normal records.`;
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
  const accessError = ensurePettyCashAccess(context);
  if (accessError) {
    return {
      status: "error",
      message: accessError,
    };
  }

  const existingLedger = await prisma.cashLedger.findFirst({
    where: { teamId: context.activeTeam!.id },
    select: {
      id: true,
      teamId: true,
    },
  });

  const openingBalanceTransaction = existingLedger
    ? await prisma.pettyCashTransaction.findFirst({
        where: {
          ledgerId: existingLedger.id,
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

  const occurredAt = parseDateInputToUtcNoon(parsed.data.occurredAt);
  const periodLockMessage = await getPeriodLockMessage(context.activeTeam!.id, occurredAt);
  if (periodLockMessage) {
    return {
      status: "error",
      message: periodLockMessage,
    };
  }

  const ledger = await getOrCreateCashLedger(context.user.id, context.activeTeam!.id);
  const numericAmount = Number(parsed.data.amount);
  const normalizedAmount = parsed.data.type === "adjustment" ? numericAmount : Math.abs(numericAmount);
  const paymentMethod = (
    parsed.data.paymentMethod || getDefaultPaymentMethod(parsed.data.type)
  ) as PettyCashPaymentMethodValue | null;

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.pettyCashTransaction.create({
      data: {
        ledgerId: ledger.id,
        createdByUserId: context.user.id,
        occurredAt,
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
          ledgerId: ledger.id,
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

export async function updatePettyCashTransactionAction(
  transactionId: string,
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
  const accessError = ensurePettyCashAccess(context);
  if (accessError) {
    return {
      status: "error",
      message: accessError,
    };
  }

  const existing = await prisma.pettyCashTransaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      ledgerId: true,
      type: true,
      amount: true,
      category: true,
      vendorPayee: true,
      paymentMethod: true,
      notes: true,
      referenceNumber: true,
      receiptReference: true,
      occurredAt: true,
      voidedAt: true,
      ledger: {
        select: {
          userId: true,
          teamId: true,
        },
      },
    },
  });

  if (!existing || existing.ledger.teamId !== context.activeTeam!.id) {
    return {
      status: "error",
      message: "Transaction not found.",
    };
  }

  if (existing.voidedAt) {
    return {
      status: "error",
      message: "Voided transactions can't be edited. Create a new entry instead.",
    };
  }

  // Type can't change post-creation — that would alter ledger semantics. Void + recreate is the proper path.
  if (parsed.data.type !== existing.type) {
    return {
      status: "error",
      message: "Transaction type can't be changed after creation. Void this entry and add a new one with the correct type.",
      fieldErrors: {
        type: "Type is locked after creation.",
      },
    };
  }

  const numericAmount = Number(parsed.data.amount);
  const normalizedAmount = parsed.data.type === "adjustment" ? numericAmount : Math.abs(numericAmount);
  const paymentMethod = (
    parsed.data.paymentMethod || getDefaultPaymentMethod(parsed.data.type)
  ) as PettyCashPaymentMethodValue | null;
  const occurredAt = parseDateInputToUtcNoon(parsed.data.occurredAt);
  const periodLockMessage = await getPeriodLockMessage(context.activeTeam!.id, existing.occurredAt)
    ?? await getPeriodLockMessage(context.activeTeam!.id, occurredAt);
  if (periodLockMessage) {
    return {
      status: "error",
      message: periodLockMessage,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pettyCashTransaction.update({
        where: { id: existing.id },
        data: {
          occurredAt,
          amount: normalizedAmount,
          category: parsed.data.category.trim(),
          vendorPayee: parsed.data.vendorPayee.trim() || null,
          paymentMethod: paymentMethod ? paymentMethod as PettyCashPaymentMethod : null,
          notes: parsed.data.notes.trim() || null,
          referenceNumber: parsed.data.referenceNumber.trim() || null,
          receiptReference: parsed.data.receiptReference.trim() || null,
        },
      });

      await tx.auditLog.create({
        data: {
          teamId: context.activeTeam?.id,
          actorUserId: context.user.id,
          action: "petty_cash.transaction.updated",
          entityType: "PettyCashTransaction",
          entityId: existing.id,
          summary: `Edited ${formatPettyCashTransactionType(existing.type)} (${formatCurrency(Math.abs(normalizedAmount))}).`,
          details: {
            before: {
              occurredAt: existing.occurredAt,
              amount: Number(existing.amount),
              category: existing.category,
              vendorPayee: existing.vendorPayee,
              paymentMethod: existing.paymentMethod,
              notes: existing.notes,
              referenceNumber: existing.referenceNumber,
              receiptReference: existing.receiptReference,
            },
            after: {
              occurredAt,
              amount: normalizedAmount,
              category: parsed.data.category.trim(),
              vendorPayee: parsed.data.vendorPayee.trim() || null,
              paymentMethod,
              notes: parsed.data.notes.trim() || null,
              referenceNumber: parsed.data.referenceNumber.trim() || null,
              receiptReference: parsed.data.receiptReference.trim() || null,
            },
          },
        },
      });
    });
  } catch (error) {
    console.error("petty_cash.transaction.update failed", error);
    return {
      status: "error",
      message: "Couldn't save the changes. Please try again.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/petty-cash");

  return {
    status: "success",
    message: "Transaction updated.",
  };
}

const voidSchema = z.object({
  reason: z.string().trim().min(3, "Add a brief reason (min 3 characters).").max(200, "Keep the reason under 200 characters."),
});

export async function voidPettyCashTransactionAction(
  transactionId: string,
  reason: string,
): Promise<ActionResult<"reason">> {
  const parsed = voidSchema.safeParse({ reason });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please add a reason for voiding.",
      fieldErrors: getFieldErrors<"reason">(parsed.error),
    };
  }

  const context = await getAppContext();
  const accessError = ensurePettyCashAccess(context);
  if (accessError) {
    return {
      status: "error",
      message: accessError,
    };
  }

  const existing = await prisma.pettyCashTransaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      type: true,
      amount: true,
      occurredAt: true,
      voidedAt: true,
      ledger: {
        select: {
          userId: true,
          teamId: true,
        },
      },
    },
  });

  if (!existing || existing.ledger.teamId !== context.activeTeam!.id) {
    return {
      status: "error",
      message: "Transaction not found.",
    };
  }

  if (existing.voidedAt) {
    return {
      status: "error",
      message: "This transaction is already voided.",
    };
  }

  if (existing.type === "opening_balance") {
    return {
      status: "error",
      message: "Opening balance can't be voided — edit it instead, or it would break the ledger history.",
    };
  }

  const periodLockMessage = await getPeriodLockMessage(context.activeTeam!.id, existing.occurredAt);
  if (periodLockMessage) {
    return {
      status: "error",
      message: periodLockMessage,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pettyCashTransaction.update({
        where: { id: existing.id },
        data: {
          voidedAt: new Date(),
          voidedByUserId: context.user.id,
          voidedReason: parsed.data.reason,
        },
      });

      await tx.auditLog.create({
        data: {
          teamId: context.activeTeam?.id,
          actorUserId: context.user.id,
          action: "petty_cash.transaction.voided",
          entityType: "PettyCashTransaction",
          entityId: existing.id,
          summary: `Voided ${formatPettyCashTransactionType(existing.type)} of ${formatCurrency(Math.abs(Number(existing.amount)))}.`,
          details: {
            reason: parsed.data.reason,
            originalAmount: Number(existing.amount),
            originalType: existing.type,
          },
        },
      });
    });
  } catch (error) {
    console.error("petty_cash.transaction.void failed", error);
    return {
      status: "error",
      message: "Couldn't void the transaction. Please try again.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/petty-cash");

  return {
    status: "success",
    message: "Transaction voided.",
  };
}

export async function closePettyCashMonthAction(
  values: PettyCashClosingFormValues,
): Promise<ActionResult<keyof PettyCashClosingFormValues>> {
  const parsed = pettyCashClosingSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the cash count.",
      fieldErrors: getFieldErrors<keyof PettyCashClosingFormValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  const accessError = ensurePettyCashAccess(context);
  if (accessError) {
    return {
      status: "error",
      message: accessError,
    };
  }

  const ledger = await prisma.cashLedger.findFirst({
    where: { teamId: context.activeTeam!.id },
    select: {
      id: true,
      transactions: {
        select: {
          id: true,
          occurredAt: true,
          createdAt: true,
          type: true,
          amount: true,
          category: true,
          vendorPayee: true,
          paymentMethod: true,
          notes: true,
          referenceNumber: true,
          receiptReference: true,
          status: true,
          reimbursementStatus: true,
          voidedAt: true,
          voidedReason: true,
        },
        orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!ledger) {
    return {
      status: "error",
      message: "Open the petty cash ledger before closing a month.",
    };
  }

  const periodMonth = getOperationalPeriodMonth(new Date());
  const existingClosing = await prisma.pettyCashClosing.findUnique({
    where: {
      ledgerId_periodMonth: {
        ledgerId: ledger.id,
        periodMonth,
      },
    },
    select: { id: true },
  });

  if (existingClosing) {
    return {
      status: "error",
      message: `${formatOperationalPeriod(periodMonth)} is already closed for petty cash.`,
    };
  }

  const rows = buildRunningLedgerRows(
    ledger.transactions.map((transaction) => ({
      id: transaction.id,
      occurredAt: transaction.occurredAt,
      createdAt: transaction.createdAt,
      type: transaction.type,
      amount: Number(transaction.amount),
      category: transaction.category,
      vendorPayee: transaction.vendorPayee,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      referenceNumber: transaction.referenceNumber,
      receiptReference: transaction.receiptReference,
      status: transaction.status,
      reimbursementStatus: transaction.reimbursementStatus,
      voidedAt: transaction.voidedAt,
      voidedReason: transaction.voidedReason,
    })),
  );
  const summary = calculatePettyCashSummary(rows, context.profile?.timezone || "Asia/Dubai");
  const countedCash = Number(parsed.data.countedCash);
  const expectedBalance = summary.currentCashBalance;
  const closingSnapshot = calculatePettyCashClosing(expectedBalance, countedCash);

  try {
    await prisma.$transaction(async (tx) => {
      const closing = await tx.pettyCashClosing.create({
        data: {
          ledgerId: ledger.id,
          teamId: context.activeTeam!.id,
          periodMonth,
          expectedBalance,
          countedCash: closingSnapshot.countedCash,
          difference: closingSnapshot.difference,
          financeNote: parsed.data.financeNote.trim() || null,
          lockedByUserId: context.user.id,
        },
      });

      await tx.operationalPeriodLock.create({
        data: {
          teamId: context.activeTeam!.id,
          module: "petty_cash",
          periodMonth,
          lockedByUserId: context.user.id,
          note: parsed.data.financeNote.trim() || null,
        },
      });

      await tx.auditLog.create({
        data: {
          teamId: context.activeTeam!.id,
          actorUserId: context.user.id,
          action: "petty_cash.month.closed",
          entityType: "PettyCashClosing",
          entityId: closing.id,
          summary: `Closed petty cash for ${formatOperationalPeriod(periodMonth)}.`,
          details: {
            ledgerId: ledger.id,
            expectedBalance,
            countedCash: closingSnapshot.countedCash,
            difference: closingSnapshot.difference,
          },
        },
      });
    });
  } catch (error) {
    console.error("petty_cash.month.close failed", error);
    return {
      status: "error",
      message: "Couldn't close the petty cash month. It may already be locked.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/petty-cash");
  revalidatePath("/app/reports");

  return {
    status: "success",
    message: `${formatOperationalPeriod(periodMonth)} petty cash is closed and locked.`,
  };
}
