import { formatCurrency } from "@/lib/utils";

export const pettyCashTransactionTypeMeta = {
  opening_balance: {
    label: "Opening Balance",
    description: "Set the starting cash float for this ledger.",
    defaultCategory: "Opening float",
    cashImpact: "increase",
  },
  cash_top_up: {
    label: "Cash Top-Up",
    description: "Record additional cash added into the petty cash fund.",
    defaultCategory: "Cash top-up",
    cashImpact: "increase",
  },
  expense_cash: {
    label: "Expense - Cash",
    description: "Track an expense paid directly from petty cash.",
    defaultCategory: "Office supplies",
    cashImpact: "decrease",
  },
  expense_card: {
    label: "Expense - Card",
    description: "Track an expense paid by card without reducing cash on hand.",
    defaultCategory: "Office supplies",
    cashImpact: "none",
  },
  reimbursement_submitted: {
    label: "Reimbursement Submitted",
    description: "Log a reimbursement claim that has been submitted but not received yet.",
    defaultCategory: "Staff reimbursement",
    cashImpact: "none",
  },
  reimbursement_received: {
    label: "Reimbursement Received",
    description: "Record reimbursement money received back into the operation.",
    defaultCategory: "Staff reimbursement",
    cashImpact: "increase",
  },
  adjustment: {
    label: "Adjustment",
    description: "Use a positive or negative manual adjustment when the physical cash count needs correction.",
    defaultCategory: "Manual adjustment",
    cashImpact: "variable",
  },
} as const;

export type PettyCashTransactionTypeValue = keyof typeof pettyCashTransactionTypeMeta;

export const pettyCashPaymentMethodMeta = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
} as const;

export type PettyCashPaymentMethodValue = keyof typeof pettyCashPaymentMethodMeta;
export type PettyCashTransactionStatusValue = "posted" | "pending" | "received";
export type PettyCashReimbursementStatusValue = "not_applicable" | "pending" | "received";
export type PettyCashReimbursementFilterValue = "all" | "pending" | "received";

export type PettyCashLedgerRow = {
  id: string;
  occurredOn: string;
  type: PettyCashTransactionTypeValue;
  typeLabel: string;
  category: string;
  vendorPayee: string | null;
  paymentMethod: PettyCashPaymentMethodValue | null;
  paymentMethodLabel: string | null;
  amount: number;
  amountLabel: string;
  cashImpact: number;
  cashImpactLabel: string;
  runningBalance: number;
  runningBalanceLabel: string;
  notes: string | null;
  referenceNumber: string | null;
  receiptReference: string | null;
  status: PettyCashTransactionStatusValue;
  statusLabel: string;
  reimbursementStatus: PettyCashReimbursementStatusValue;
  reimbursementStatusLabel: string;
  createdAt: string;
};

export type PettyCashSummary = {
  currentCashBalance: number;
  thisMonthExpenses: number;
  pendingReimbursementTotal: number;
  reimbursementsReceivedTotal: number;
  transactionCount: number;
};

export const pettyCashDefaultCategories = [
  "Opening float",
  "Cash top-up",
  "Office supplies",
  "Maintenance",
  "Fuel",
  "Courier",
  "Travel",
  "Meals",
  "Packaging",
  "Utilities",
  "Admin",
  "Staff reimbursement",
  "Manual adjustment",
  "Miscellaneous",
] as const;

export const pettyCashTransactionTypes = Object.entries(pettyCashTransactionTypeMeta).map(([value, meta]) => ({
  value: value as PettyCashTransactionTypeValue,
  ...meta,
}));

export const pettyCashPaymentMethods = Object.entries(pettyCashPaymentMethodMeta).map(([value, label]) => ({
  value: value as PettyCashPaymentMethodValue,
  label,
}));

export function formatPettyCashTransactionType(value: PettyCashTransactionTypeValue) {
  return pettyCashTransactionTypeMeta[value].label;
}

export function formatPettyCashPaymentMethod(value: PettyCashPaymentMethodValue | null | undefined) {
  return value ? pettyCashPaymentMethodMeta[value] : null;
}

export function formatPettyCashStatus(value: PettyCashTransactionStatusValue) {
  switch (value) {
    case "pending":
      return "Pending";
    case "received":
      return "Received";
    default:
      return "Posted";
  }
}

export function formatPettyCashReimbursementStatus(value: PettyCashReimbursementStatusValue) {
  switch (value) {
    case "pending":
      return "Pending reimbursement";
    case "received":
      return "Reimbursement received";
    default:
      return "Not reimbursement-related";
  }
}

export function getSuggestedCategory(type: PettyCashTransactionTypeValue) {
  return pettyCashTransactionTypeMeta[type].defaultCategory;
}

export function getDerivedStatus(type: PettyCashTransactionTypeValue): PettyCashTransactionStatusValue {
  switch (type) {
    case "reimbursement_submitted":
      return "pending";
    case "reimbursement_received":
      return "received";
    default:
      return "posted";
  }
}

export function getDerivedReimbursementStatus(type: PettyCashTransactionTypeValue): PettyCashReimbursementStatusValue {
  switch (type) {
    case "reimbursement_submitted":
      return "pending";
    case "reimbursement_received":
      return "received";
    default:
      return "not_applicable";
  }
}

export function getDefaultPaymentMethod(type: PettyCashTransactionTypeValue): PettyCashPaymentMethodValue | null {
  switch (type) {
    case "expense_cash":
      return "cash";
    case "expense_card":
      return "card";
    case "cash_top_up":
    case "reimbursement_received":
      return "bank_transfer";
    default:
      return null;
  }
}

export function typeNeedsSelectablePaymentMethod(type: PettyCashTransactionTypeValue) {
  return type === "cash_top_up" || type === "reimbursement_received";
}

export function typeShowsReceiptReference(type: PettyCashTransactionTypeValue) {
  return type === "expense_cash" || type === "expense_card" || type === "reimbursement_submitted" || type === "reimbursement_received";
}

export function getCashImpact(type: PettyCashTransactionTypeValue, amount: number) {
  switch (type) {
    case "opening_balance":
    case "cash_top_up":
    case "reimbursement_received":
      return amount;
    case "expense_cash":
      return -amount;
    case "adjustment":
      return amount;
    default:
      return 0;
  }
}

export function formatCashImpact(value: number) {
  if (value === 0) {
    return "No cash impact";
  }

  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

export function buildRunningLedgerRows(
  transactions: Array<{
    id: string;
    occurredAt: Date | string;
    createdAt: Date | string;
    type: PettyCashTransactionTypeValue;
    amount: number;
    category: string;
    vendorPayee: string | null;
    paymentMethod: PettyCashPaymentMethodValue | null;
    notes: string | null;
    referenceNumber: string | null;
    receiptReference: string | null;
    status: PettyCashTransactionStatusValue;
    reimbursementStatus: PettyCashReimbursementStatusValue;
  }>,
): PettyCashLedgerRow[] {
  let runningBalance = 0;

  return transactions.map((transaction) => {
    const amount = Number(transaction.amount);
    const cashImpact = getCashImpact(transaction.type, amount);
    runningBalance += cashImpact;
    const occurredOn = transaction.occurredAt instanceof Date
      ? transaction.occurredAt.toISOString().slice(0, 10)
      : `${transaction.occurredAt}`.slice(0, 10);
    const createdAt = transaction.createdAt instanceof Date
      ? transaction.createdAt.toISOString()
      : `${transaction.createdAt}`;

    return {
      id: transaction.id,
      occurredOn,
      type: transaction.type,
      typeLabel: formatPettyCashTransactionType(transaction.type),
      category: transaction.category,
      vendorPayee: transaction.vendorPayee,
      paymentMethod: transaction.paymentMethod,
      paymentMethodLabel: formatPettyCashPaymentMethod(transaction.paymentMethod),
      amount,
      amountLabel: formatCurrency(Math.abs(amount)),
      cashImpact,
      cashImpactLabel: formatCashImpact(cashImpact),
      runningBalance,
      runningBalanceLabel: formatCurrency(runningBalance),
      notes: transaction.notes,
      referenceNumber: transaction.referenceNumber,
      receiptReference: transaction.receiptReference,
      status: transaction.status,
      statusLabel: formatPettyCashStatus(transaction.status),
      reimbursementStatus: transaction.reimbursementStatus,
      reimbursementStatusLabel: formatPettyCashReimbursementStatus(transaction.reimbursementStatus),
      createdAt,
    };
  });
}

export function calculatePettyCashSummary(rows: PettyCashLedgerRow[], referenceDate = new Date()): PettyCashSummary {
  const monthStart = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 1));

  const thisMonthExpenses = rows.reduce((total, row) => {
    const occurredAt = new Date(`${row.occurredOn}T12:00:00.000Z`);
    const isThisMonth = occurredAt >= monthStart && occurredAt < monthEnd;
    const isExpense = row.type === "expense_cash" || row.type === "expense_card";

    return isThisMonth && isExpense ? total + row.amount : total;
  }, 0);

  const submittedTotal = rows.reduce((total, row) => row.type === "reimbursement_submitted" ? total + row.amount : total, 0);
  const receivedTotal = rows.reduce((total, row) => row.type === "reimbursement_received" ? total + row.amount : total, 0);

  return {
    currentCashBalance: rows.at(-1)?.runningBalance ?? 0,
    thisMonthExpenses,
    pendingReimbursementTotal: Math.max(submittedTotal - receivedTotal, 0),
    reimbursementsReceivedTotal: receivedTotal,
    transactionCount: rows.length,
  };
}

export function filterPettyCashRows(
  rows: PettyCashLedgerRow[],
  filters: {
    from?: string;
    to?: string;
    type?: string;
    category?: string;
    reimbursement?: string;
  },
) {
  return rows.filter((row) => {
    if (filters.from && row.occurredOn < filters.from) {
      return false;
    }

    if (filters.to && row.occurredOn > filters.to) {
      return false;
    }

    if (filters.type && filters.type !== "all" && row.type !== filters.type) {
      return false;
    }

    if (filters.category && filters.category !== "all" && row.category !== filters.category) {
      return false;
    }

    if (filters.reimbursement && filters.reimbursement !== "all") {
      if (filters.reimbursement === "pending" && row.reimbursementStatus !== "pending") {
        return false;
      }

      if (filters.reimbursement === "received" && row.reimbursementStatus !== "received") {
        return false;
      }
    }

    return true;
  });
}

export function parseDateInputToUtcNoon(value: string) {
  const [year, month, day] = value.split("-").map((segment) => Number(segment));
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function formatPettyCashDate(value: string) {
  return new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00.000Z`));
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildPettyCashCsv(rows: PettyCashLedgerRow[]) {
  const headers = [
    "Date",
    "Type",
    "Category",
    "Vendor/Payee",
    "Amount",
    "Cash Impact",
    "Running Balance",
    "Payment Method",
    "Status",
    "Reference Number",
    "Receipt Reference",
    "Notes",
  ];

  const lines = rows.map((row) => [
    row.occurredOn,
    row.typeLabel,
    row.category,
    row.vendorPayee ?? "",
    `${row.amount}`,
    `${row.cashImpact}`,
    `${row.runningBalance}`,
    row.paymentMethodLabel ?? "",
    row.statusLabel,
    row.referenceNumber ?? "",
    row.receiptReference ?? "",
    row.notes ?? "",
  ].map((cell) => escapeCsvValue(cell)).join(","));

  return [headers.join(","), ...lines].join("\n");
}