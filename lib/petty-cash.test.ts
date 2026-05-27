import { describe, expect, it } from "vitest";
import {
  buildRunningLedgerRows,
  calculatePettyCashClosing,
  calculatePettyCashSummary,
  buildPettyCashCsv,
} from "./petty-cash";

type Tx = Parameters<typeof buildRunningLedgerRows>[0][number];

function tx(overrides: Partial<Tx> & { id: string; type: Tx["type"]; amount: number; occurredAt: string }): Tx {
  return {
    id: overrides.id,
    occurredAt: overrides.occurredAt,
    createdAt: overrides.createdAt ?? overrides.occurredAt,
    type: overrides.type,
    amount: overrides.amount,
    category: overrides.category ?? "Test",
    vendorPayee: overrides.vendorPayee ?? null,
    paymentMethod: overrides.paymentMethod ?? null,
    notes: overrides.notes ?? null,
    referenceNumber: overrides.referenceNumber ?? null,
    receiptReference: overrides.receiptReference ?? null,
    status: overrides.status ?? "posted",
    reimbursementStatus: overrides.reimbursementStatus ?? "not_applicable",
    voidedAt: overrides.voidedAt ?? null,
    voidedReason: overrides.voidedReason ?? null,
  };
}

describe("buildRunningLedgerRows — voided handling", () => {
  it("excludes voided txns from running balance", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_cash", amount: 200, occurredAt: "2026-05-02" }), // -200 → 800
      tx({ id: "3", type: "expense_cash", amount: 500, occurredAt: "2026-05-03", voidedAt: "2026-05-04" }), // VOIDED → 0
      tx({ id: "4", type: "expense_cash", amount: 100, occurredAt: "2026-05-05" }), // -100 → 700
    ]);

    expect(rows[0].runningBalance).toBe(1000);
    expect(rows[1].runningBalance).toBe(800);
    expect(rows[2].runningBalance).toBe(800); // voided row leaves balance unchanged
    expect(rows[2].cashImpact).toBe(0);
    expect(rows[2].voided).toBe(true);
    expect(rows[3].runningBalance).toBe(700);
  });

  it("flags voided rows with reason in output", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 500, occurredAt: "2026-05-01" }),
      tx({
        id: "2",
        type: "expense_cash",
        amount: 75,
        occurredAt: "2026-05-02",
        voidedAt: "2026-05-03",
        voidedReason: "Duplicate of #1",
      }),
    ]);

    expect(rows[1].voided).toBe(true);
    expect(rows[1].voidedReason).toBe("Duplicate of #1");
    expect(rows[1].voidedAt).toBe("2026-05-03");
  });

  it("returns voided=false and null reason when never voided", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 100, occurredAt: "2026-05-01" }),
    ]);
    expect(rows[0].voided).toBe(false);
    expect(rows[0].voidedReason).toBeNull();
    expect(rows[0].voidedAt).toBeNull();
  });

  it("accepts Date objects for voidedAt", () => {
    const rows = buildRunningLedgerRows([
      tx({
        id: "1",
        type: "expense_cash",
        amount: 50,
        occurredAt: "2026-05-01",
        voidedAt: new Date("2026-05-02T10:00:00.000Z"),
      }),
    ]);
    expect(rows[0].voided).toBe(true);
    expect(rows[0].cashImpact).toBe(0);
  });
});

describe("calculatePettyCashSummary — timezone awareness", () => {
  it("includes 1-June expense in June total when reference is 02:00 Dubai 1 June (UTC says May)", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-06-01" }),
      tx({ id: "2", type: "expense_cash", amount: 50, occurredAt: "2026-06-01" }),
    ]);
    const refDubaiPostMidnight = new Date("2026-05-31T22:00:00.000Z");
    const summaryDubai = calculatePettyCashSummary(rows, "Asia/Dubai", refDubaiPostMidnight);
    expect(summaryDubai.thisMonthExpenses).toBe(50);

    // UTC view of the same instant still thinks it's May → no June expenses counted
    const summaryUtc = calculatePettyCashSummary(rows, "UTC", refDubaiPostMidnight);
    expect(summaryUtc.thisMonthExpenses).toBe(0);
  });
});

describe("calculatePettyCashSummary — voided exclusion", () => {
  const ref = new Date("2026-05-15T12:00:00.000Z");

  it("excludes voided expense_cash from thisMonthExpenses", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_cash", amount: 200, occurredAt: "2026-05-05" }),
      tx({ id: "3", type: "expense_cash", amount: 999, occurredAt: "2026-05-06", voidedAt: "2026-05-07" }),
    ]);
    const summary = calculatePettyCashSummary(rows, "Asia/Dubai", ref);
    expect(summary.thisMonthExpenses).toBe(200);
  });

  it("excludes voided card spend from cardOutstandingTotal", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_card", amount: 300, occurredAt: "2026-05-02" }),
      tx({ id: "3", type: "expense_card", amount: 999, occurredAt: "2026-05-03", voidedAt: "2026-05-04" }),
    ]);
    const summary = calculatePettyCashSummary(rows, "Asia/Dubai", ref);
    expect(summary.cardOutstandingTotal).toBe(300);
  });

  it("excludes voided reimbursement from pending total", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_cash", amount: 300, occurredAt: "2026-05-02" }),
      tx({ id: "3", type: "reimbursement_submitted", amount: 300, occurredAt: "2026-05-03", voidedAt: "2026-05-04" }),
    ]);
    const summary = calculatePettyCashSummary(rows, "Asia/Dubai", ref);
    // The submitted-but-voided reimbursement shouldn't count
    expect(summary.pendingReimbursementTotal).toBe(0);
    // And unsubmitted should still show the expense as needing a claim
    expect(summary.unsubmittedExpensesTotal).toBe(300);
  });

  it("currentCashBalance reflects voided exclusion via running balance", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 1000, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_cash", amount: 100, occurredAt: "2026-05-02" }),
      tx({ id: "3", type: "expense_cash", amount: 500, occurredAt: "2026-05-03", voidedAt: "2026-05-04" }),
    ]);
    const summary = calculatePettyCashSummary(rows, "Asia/Dubai", ref);
    expect(summary.currentCashBalance).toBe(900);
  });
});

describe("buildPettyCashCsv — voided columns", () => {
  it("includes Voided and Voided Reason columns", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 500, occurredAt: "2026-05-01" }),
      tx({ id: "2", type: "expense_cash", amount: 50, occurredAt: "2026-05-02", voidedAt: "2026-05-03", voidedReason: "Wrong vendor" }),
    ]);
    const csv = buildPettyCashCsv(rows);
    const [header, , voidedLine] = csv.split("\n");
    expect(header).toContain("Voided");
    expect(header).toContain("Voided Reason");
    expect(voidedLine).toContain(",Yes,");
    expect(voidedLine).toContain("Wrong vendor");
  });

  it("leaves voided cells empty for non-voided rows", () => {
    const rows = buildRunningLedgerRows([
      tx({ id: "1", type: "opening_balance", amount: 500, occurredAt: "2026-05-01" }),
    ]);
    const csv = buildPettyCashCsv(rows);
    const [, dataLine] = csv.split("\n");
    // Two consecutive commas where Yes/reason would be
    expect(dataLine).toMatch(/,,/);
  });
});

describe("calculatePettyCashClosing", () => {
  it("marks balanced when counted cash matches expected balance", () => {
    expect(calculatePettyCashClosing(500, 500)).toEqual({
      expectedBalance: 500,
      countedCash: 500,
      difference: 0,
      status: "balanced",
    });
  });

  it("marks short and rounds to 2 decimals", () => {
    expect(calculatePettyCashClosing(500, 499.994)).toEqual({
      expectedBalance: 500,
      countedCash: 499.994,
      difference: -0.01,
      status: "short",
    });
  });

  it("marks over when physical cash exceeds expected balance", () => {
    expect(calculatePettyCashClosing(500, 510)).toMatchObject({
      difference: 10,
      status: "over",
    });
  });
});
