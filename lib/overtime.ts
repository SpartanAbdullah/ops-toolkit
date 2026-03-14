import { formatCurrency } from "@/lib/utils";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const NIGHT_WINDOW_START = 22 * MINUTES_PER_HOUR;
const NIGHT_WINDOW_END = 28 * MINUTES_PER_HOUR;

export const weekendDayOptions = [
  { value: "sun", label: "Sunday" },
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
] as const;

export const overtimeCalculationModes = [
  {
    value: "simple",
    label: "Simple Mode",
    description: "Overtime starts after standard daily hours and uses a fixed AED per hour rate.",
  },
  {
    value: "mohre_compliant",
    label: "MOHRE-Compliant Mode",
    description: "UAE-style overtime on basic salary with daytime, night, and rest day handling.",
  },
] as const;

export const overtimeEntryStatuses = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "auto_approved", label: "Auto-approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const overtimeReviewDecisions = [
  { value: "approved", label: "Approve as final" },
  { value: "partially_approved", label: "Approve with edits" },
  { value: "rejected", label: "Reject" },
] as const;

export const overtimeRangeOptions = [
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range" },
] as const;

export type WeekendDayValue = (typeof weekendDayOptions)[number]["value"];
export type OvertimeCalculationModeValue = (typeof overtimeCalculationModes)[number]["value"];
export type OvertimeEntryStatusValue = Exclude<(typeof overtimeEntryStatuses)[number]["value"], "all">;
export type OvertimeEntryStatusFilterValue = (typeof overtimeEntryStatuses)[number]["value"];
export type OvertimeApprovalDecisionValue = (typeof overtimeReviewDecisions)[number]["value"];
export type OvertimeRangeValue = (typeof overtimeRangeOptions)[number]["value"];
export type OvertimeScope = "individual" | "team";

export type OvertimeSettingsSnapshot = {
  scope: OvertimeScope;
  calculationMode: OvertimeCalculationModeValue;
  standardDailyHours: number;
  simpleHourlyRate: number | null;
  weekendDays: WeekendDayValue[];
  ramadanEnabled: boolean;
  ramadanStartDate: string | null;
  ramadanEndDate: string | null;
  individualBasicMonthlySalary: number | null;
};

export type OvertimeCompensationSnapshot = {
  workerUserId?: string;
  basicMonthlySalary: number | null;
};

export type OvertimeFilters = {
  range: OvertimeRangeValue;
  from?: string;
  to?: string;
  status?: OvertimeEntryStatusFilterValue;
  workerId?: string;
};

export type OvertimeCalculationResult = {
  error: string | null;
  totalWorkedMinutes: number;
  overtimeMinutes: number;
  dayOvertimeMinutes: number;
  nightOvertimeMinutes: number;
  amount: number;
  standardDailyHoursApplied: number;
  rateDescription: string;
  calculationSummary: string;
  isWeekend: boolean;
  isHoliday: boolean;
  ramadanApplied: boolean;
  wellbeingWarning: string | null;
};

export type OvertimeLedgerRow = {
  id: string;
  workerUserId: string;
  workerName: string;
  workedOn: string;
  startTimeLabel: string;
  endTimeLabel: string;
  overnight: boolean;
  totalWorkedMinutes: number;
  totalWorkedLabel: string;
  overtimeMinutes: number;
  overtimeLabel: string;
  amount: number;
  amountLabel: string;
  status: OvertimeEntryStatusValue;
  statusLabel: string;
  statusVariant: "blue" | "green" | "amber" | "red" | "subtle";
  notes: string | null;
  approvedBy: string | null;
  approvalComment: string | null;
  lastDecisionAt: string | null;
  paymentStatusLabel: string;
  paymentStatusVariant: "green" | "amber" | "subtle";
  paidUntilDate: string | null;
  wellbeingWarning: boolean;
  calculationSummary: string;
  rateDescription: string;
  isModifiedApproval: boolean;
};

export type OvertimeSummary = {
  pendingCount: number;
  approvedHoursThisMonth: number;
  approvedAmountThisMonth: number;
  unpaidApprovedCount: number;
  approvedEntryCountThisMonth: number;
};

export type OvertimeWorkerBreakdown = {
  workerUserId: string;
  workerName: string;
  overtimeMinutes: number;
  amount: number;
  approvedCount: number;
  pendingCount: number;
  paidUntilDate: string | null;
};

const weekdayIndexMap: Record<WeekendDayValue, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function getDefaultWeekendDays(): WeekendDayValue[] {
  return ["fri", "sat"];
}

export function getDefaultOvertimeSettingsSnapshot(scope: OvertimeScope = "individual"): OvertimeSettingsSnapshot {
  return {
    scope,
    calculationMode: "simple",
    standardDailyHours: 8,
    simpleHourlyRate: null,
    weekendDays: getDefaultWeekendDays(),
    ramadanEnabled: false,
    ramadanStartDate: null,
    ramadanEndDate: null,
    individualBasicMonthlySalary: null,
  };
}

export function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInputToUtcNoon(value: string) {
  const [year, month, day] = value.split("-").map((segment) => Number(segment));
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function dateFromInput(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function addUtcDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function getUtcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function overlapMinutes(start: number, end: number, windowStart: number, windowEnd: number) {
  return Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));
}

function parseTimeInput(value: string) {
  const parts = value.split(":");
  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * MINUTES_PER_HOUR + minutes;
}

export function formatMinutesAsClock(minutes: number) {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / MINUTES_PER_HOUR);
  const remainder = normalized % MINUTES_PER_HOUR;
  return `${`${hours}`.padStart(2, "0")}:${`${remainder}`.padStart(2, "0")}`;
}

export function formatMinutesAsHours(minutes: number) {
  return `${(minutes / MINUTES_PER_HOUR).toFixed(2)} hrs`;
}

export function formatOvertimeDate(value: string) {
  return new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(dateFromInput(value));
}

export function formatOvertimeMode(value: OvertimeCalculationModeValue) {
  return overtimeCalculationModes.find((mode) => mode.value === value)?.label ?? "Simple Mode";
}

export function formatOvertimeStatus(value: OvertimeEntryStatusValue) {
  switch (value) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Auto-approved";
  }
}

export function getOvertimeStatusVariant(value: OvertimeEntryStatusValue) {
  switch (value) {
    case "pending":
      return "amber" as const;
    case "approved":
      return "green" as const;
    case "rejected":
      return "red" as const;
    default:
      return "blue" as const;
  }
}

export function getRangeBounds(range: OvertimeRangeValue, referenceDate = new Date()) {
  const reference = getUtcDayStart(referenceDate);
  const dayOfWeek = reference.getUTCDay();
  const daysFromMonday = (dayOfWeek + 6) % 7;
  const thisWeekStart = addUtcDays(reference, -daysFromMonday);
  const thisWeekEnd = addUtcDays(thisWeekStart, 6);

  switch (range) {
    case "this_week":
      return { from: formatDateInput(thisWeekStart), to: formatDateInput(thisWeekEnd) };
    case "last_week": {
      const from = addUtcDays(thisWeekStart, -7);
      const to = addUtcDays(thisWeekStart, -1);
      return { from: formatDateInput(from), to: formatDateInput(to) };
    }
    case "last_month": {
      const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1));
      const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 0));
      return { from: formatDateInput(start), to: formatDateInput(end) };
    }
    case "custom":
      return { from: "", to: "" };
    default: {
      const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
      const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0));
      return { from: formatDateInput(start), to: formatDateInput(end) };
    }
  }
}

export function normalizeOvertimeFilters(filters: Partial<OvertimeFilters>) {
  const range = overtimeRangeOptions.some((option) => option.value === filters.range) ? (filters.range as OvertimeRangeValue) : "this_month";
  const derivedBounds = getRangeBounds(range);
  const from = range === "custom" ? filters.from ?? "" : derivedBounds.from;
  const to = range === "custom" ? filters.to ?? "" : derivedBounds.to;
  const status = overtimeEntryStatuses.some((option) => option.value === filters.status) ? filters.status : "all";

  return {
    range,
    from,
    to,
    status: status as OvertimeEntryStatusFilterValue,
    workerId: filters.workerId ?? "all",
  };
}

function isWeekendDate(value: string, weekendDays: WeekendDayValue[]) {
  const weekday = dateFromInput(value).getUTCDay();
  return weekendDays.some((day) => weekdayIndexMap[day] === weekday);
}

function isDateWithinRange(value: string, startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) {
    return false;
  }

  return value >= startDate && value <= endDate;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildCalculationSummary(input: {
  calculationMode: OvertimeCalculationModeValue;
  overtimeMinutes: number;
  totalWorkedMinutes: number;
  dayOvertimeMinutes: number;
  nightOvertimeMinutes: number;
  rate: number | null;
  isWeekend: boolean;
  isHoliday: boolean;
}) {
  if (!input.overtimeMinutes) {
    return "No overtime was generated from this shift.";
  }

  if (input.calculationMode === "simple") {
    return `Calculated from ${formatMinutesAsHours(input.overtimeMinutes)} at a fixed ${formatCurrency(input.rate ?? 0)} per hour.`;
  }

  if (input.isWeekend || input.isHoliday) {
    return `All ${formatMinutesAsHours(input.totalWorkedMinutes)} worked hours are treated at 1.5x the basic hourly rate on rest days or public holidays for this MVP.`;
  }

  if (input.nightOvertimeMinutes > 0 && input.dayOvertimeMinutes > 0) {
    return `${formatMinutesAsHours(input.dayOvertimeMinutes)} daytime OT uses 1.25x and ${formatMinutesAsHours(input.nightOvertimeMinutes)} night OT uses 1.5x on the basic hourly rate.`;
  }

  if (input.nightOvertimeMinutes > 0) {
    return `Night overtime from 10 PM to 4 AM is calculated at 1.5x the basic hourly rate.`;
  }

  return `Daytime overtime is calculated at 1.25x the basic hourly rate.`;
}

function buildRateDescription(input: {
  calculationMode: OvertimeCalculationModeValue;
  rate: number | null;
  isWeekend: boolean;
  isHoliday: boolean;
  dayOvertimeMinutes: number;
  nightOvertimeMinutes: number;
}) {
  if (input.calculationMode === "simple") {
    return input.rate ? `Fixed overtime rate: ${formatCurrency(input.rate)} / hour` : "Fixed overtime rate not configured";
  }

  if (!input.rate) {
    return "Basic salary rate is not configured";
  }

  if (input.isWeekend || input.isHoliday) {
    return `Basic hourly rate: ${formatCurrency(input.rate)} with 1.5x rest day / holiday multiplier`;
  }

  if (input.dayOvertimeMinutes > 0 && input.nightOvertimeMinutes > 0) {
    return `Basic hourly rate: ${formatCurrency(input.rate)} with split 1.25x / 1.5x multipliers`;
  }

  if (input.nightOvertimeMinutes > 0) {
    return `Basic hourly rate: ${formatCurrency(input.rate)} with 1.5x night multiplier`;
  }

  return `Basic hourly rate: ${formatCurrency(input.rate)} with 1.25x daytime multiplier`;
}

export function calculateOvertime(input: {
  workedDate: string;
  startTime: string;
  endTime: string;
  overnight: boolean;
  calculationMode: OvertimeCalculationModeValue;
  standardDailyHours: number;
  simpleHourlyRate?: number | null;
  basicMonthlySalary?: number | null;
  weekendDays: WeekendDayValue[];
  holidayDates?: string[];
  ramadanEnabled?: boolean;
  ramadanStartDate?: string | null;
  ramadanEndDate?: string | null;
}): OvertimeCalculationResult {
  const startMinutes = parseTimeInput(input.startTime);
  const endMinutes = parseTimeInput(input.endTime);
  if (startMinutes === null || endMinutes === null) {
    return {
      error: "Enter valid shift start and end times.",
      totalWorkedMinutes: 0,
      overtimeMinutes: 0,
      dayOvertimeMinutes: 0,
      nightOvertimeMinutes: 0,
      amount: 0,
      standardDailyHoursApplied: input.standardDailyHours,
      rateDescription: "",
      calculationSummary: "",
      isWeekend: false,
      isHoliday: false,
      ramadanApplied: false,
      wellbeingWarning: null,
    };
  }

  if (endMinutes <= startMinutes && !input.overnight) {
    return {
      error: "If the shift ends after midnight, switch on overnight handling.",
      totalWorkedMinutes: 0,
      overtimeMinutes: 0,
      dayOvertimeMinutes: 0,
      nightOvertimeMinutes: 0,
      amount: 0,
      standardDailyHoursApplied: input.standardDailyHours,
      rateDescription: "",
      calculationSummary: "",
      isWeekend: false,
      isHoliday: false,
      ramadanApplied: false,
      wellbeingWarning: null,
    };
  }

  const adjustedEndMinutes = input.overnight || endMinutes <= startMinutes ? endMinutes + MINUTES_PER_DAY : endMinutes;
  const totalWorkedMinutes = adjustedEndMinutes - startMinutes;
  if (totalWorkedMinutes <= 0 || totalWorkedMinutes > MINUTES_PER_DAY) {
    return {
      error: "Shift length must be greater than zero and within one day.",
      totalWorkedMinutes: 0,
      overtimeMinutes: 0,
      dayOvertimeMinutes: 0,
      nightOvertimeMinutes: 0,
      amount: 0,
      standardDailyHoursApplied: input.standardDailyHours,
      rateDescription: "",
      calculationSummary: "",
      isWeekend: false,
      isHoliday: false,
      ramadanApplied: false,
      wellbeingWarning: null,
    };
  }

  const ramadanApplied = Boolean(input.ramadanEnabled && isDateWithinRange(input.workedDate, input.ramadanStartDate, input.ramadanEndDate));
  const standardDailyHoursApplied = ramadanApplied ? Math.min(input.standardDailyHours, 6) : input.standardDailyHours;
  const standardMinutes = Math.round(standardDailyHoursApplied * MINUTES_PER_HOUR);
  const weekendDays = input.weekendDays.length ? input.weekendDays : getDefaultWeekendDays();
  const isWeekend = isWeekendDate(input.workedDate, weekendDays);
  const isHoliday = (input.holidayDates ?? []).includes(input.workedDate);

  let overtimeMinutes = 0;
  let dayOvertimeMinutes = 0;
  let nightOvertimeMinutes = 0;
  let amount = 0;
  let rate: number | null = null;

  if (input.calculationMode === "simple") {
    rate = normalizeNumber(input.simpleHourlyRate);
    if (!rate || rate <= 0) {
      return {
        error: "Set a fixed overtime rate before logging entries in Simple Mode.",
        totalWorkedMinutes,
        overtimeMinutes: 0,
        dayOvertimeMinutes: 0,
        nightOvertimeMinutes: 0,
        amount: 0,
        standardDailyHoursApplied,
        rateDescription: "",
        calculationSummary: "",
        isWeekend,
        isHoliday,
        ramadanApplied,
        wellbeingWarning: null,
      };
    }

    overtimeMinutes = Math.max(0, totalWorkedMinutes - standardMinutes);
    dayOvertimeMinutes = overtimeMinutes;
    amount = roundCurrency((overtimeMinutes / MINUTES_PER_HOUR) * rate);
  } else {
    const basicMonthlySalary = normalizeNumber(input.basicMonthlySalary);
    if (!basicMonthlySalary || basicMonthlySalary <= 0) {
      return {
        error: "Add the worker basic monthly salary before using MOHRE-Compliant Mode.",
        totalWorkedMinutes,
        overtimeMinutes: 0,
        dayOvertimeMinutes: 0,
        nightOvertimeMinutes: 0,
        amount: 0,
        standardDailyHoursApplied,
        rateDescription: "",
        calculationSummary: "",
        isWeekend,
        isHoliday,
        ramadanApplied,
        wellbeingWarning: null,
      };
    }

    rate = basicMonthlySalary / 30 / standardDailyHoursApplied;

    if (isWeekend || isHoliday) {
      overtimeMinutes = totalWorkedMinutes;
      dayOvertimeMinutes = overtimeMinutes;
      amount = roundCurrency((overtimeMinutes / MINUTES_PER_HOUR) * rate * 1.5);
    } else {
      overtimeMinutes = Math.max(0, totalWorkedMinutes - standardMinutes);
      const overtimeStart = adjustedEndMinutes - overtimeMinutes;
      nightOvertimeMinutes = overlapMinutes(overtimeStart, adjustedEndMinutes, 0, 4 * MINUTES_PER_HOUR)
        + overlapMinutes(overtimeStart, adjustedEndMinutes, NIGHT_WINDOW_START, NIGHT_WINDOW_END);
      nightOvertimeMinutes = Math.min(nightOvertimeMinutes, overtimeMinutes);
      dayOvertimeMinutes = Math.max(0, overtimeMinutes - nightOvertimeMinutes);
      amount = roundCurrency(((dayOvertimeMinutes / MINUTES_PER_HOUR) * rate * 1.25) + ((nightOvertimeMinutes / MINUTES_PER_HOUR) * rate * 1.5));
    }
  }

  const wellbeingWarning = overtimeMinutes > 120
    ? "UAE law limits OT to 2 hrs/day where possible - prioritize health and only take OT you can manage comfortably."
    : null;

  return {
    error: null,
    totalWorkedMinutes,
    overtimeMinutes,
    dayOvertimeMinutes,
    nightOvertimeMinutes,
    amount,
    standardDailyHoursApplied,
    rateDescription: buildRateDescription({
      calculationMode: input.calculationMode,
      rate,
      isWeekend,
      isHoliday,
      dayOvertimeMinutes,
      nightOvertimeMinutes,
    }),
    calculationSummary: buildCalculationSummary({
      calculationMode: input.calculationMode,
      overtimeMinutes,
      totalWorkedMinutes,
      dayOvertimeMinutes,
      nightOvertimeMinutes,
      rate,
      isWeekend,
      isHoliday,
    }),
    isWeekend,
    isHoliday,
    ramadanApplied,
    wellbeingWarning,
  };
}

export function getEffectiveOvertimeMetrics(entry: {
  status: OvertimeEntryStatusValue;
  totalWorkedMinutes: number;
  overtimeMinutes: number;
  calculatedOvertimeAmount: number;
  approvedWorkedMinutes?: number | null;
  approvedOvertimeMinutes?: number | null;
  approvedOvertimeAmount?: number | null;
}) {
  if (entry.status === "approved") {
    return {
      workedMinutes: entry.approvedWorkedMinutes ?? entry.totalWorkedMinutes,
      overtimeMinutes: entry.approvedOvertimeMinutes ?? entry.overtimeMinutes,
      amount: entry.approvedOvertimeAmount ?? entry.calculatedOvertimeAmount,
      modified: entry.approvedWorkedMinutes != null || entry.approvedOvertimeMinutes != null || entry.approvedOvertimeAmount != null,
    };
  }

  return {
    workedMinutes: entry.totalWorkedMinutes,
    overtimeMinutes: entry.overtimeMinutes,
    amount: entry.calculatedOvertimeAmount,
    modified: false,
  };
}

export function getLatestPaymentMap(records: Array<{ workerUserId: string; paidUntilDate: Date | string }>) {
  return records.reduce<Record<string, string>>((accumulator, record) => {
    const paidUntilDate = record.paidUntilDate instanceof Date
      ? record.paidUntilDate.toISOString().slice(0, 10)
      : `${record.paidUntilDate}`.slice(0, 10);

    if (!accumulator[record.workerUserId] || accumulator[record.workerUserId] < paidUntilDate) {
      accumulator[record.workerUserId] = paidUntilDate;
    }

    return accumulator;
  }, {});
}

export function buildOvertimeRows(
  entries: Array<{
    id: string;
    workerUserId: string;
    workerName: string;
    workedDate: Date | string;
    startTimeMinutes: number;
    endTimeMinutes: number;
    overnight: boolean;
    notes: string | null;
    calculationMode: OvertimeCalculationModeValue;
    standardDailyHours: number;
    totalWorkedMinutes: number;
    overtimeMinutes: number;
    dayOvertimeMinutes: number;
    nightOvertimeMinutes: number;
    calculatedOvertimeAmount: number;
    approvedWorkedMinutes?: number | null;
    approvedOvertimeMinutes?: number | null;
    approvedOvertimeAmount?: number | null;
    fixedHourlyRate?: number | null;
    basicMonthlySalary?: number | null;
    isWeekend: boolean;
    isHoliday: boolean;
    wellbeingWarning: boolean;
    status: OvertimeEntryStatusValue;
    latestApproval?: {
      approverName: string | null;
      comment: string | null;
      createdAt: Date | string;
    } | null;
    lastDecisionAt?: Date | string | null;
  }>,
  latestPaymentsByWorker: Record<string, string>,
) {
  return entries.map<OvertimeLedgerRow>((entry) => {
    const workedOn = entry.workedDate instanceof Date ? entry.workedDate.toISOString().slice(0, 10) : `${entry.workedDate}`.slice(0, 10);
    const effective = getEffectiveOvertimeMetrics({
      status: entry.status,
      totalWorkedMinutes: entry.totalWorkedMinutes,
      overtimeMinutes: entry.overtimeMinutes,
      calculatedOvertimeAmount: entry.calculatedOvertimeAmount,
      approvedWorkedMinutes: entry.approvedWorkedMinutes,
      approvedOvertimeMinutes: entry.approvedOvertimeMinutes,
      approvedOvertimeAmount: entry.approvedOvertimeAmount,
    });
    const paidUntilDate = latestPaymentsByWorker[entry.workerUserId] ?? null;
    const payable = entry.status === "approved" || entry.status === "auto_approved";
    const paid = Boolean(paidUntilDate && paidUntilDate >= workedOn && payable);

    let paymentStatusLabel = "Awaiting approval";
    let paymentStatusVariant: OvertimeLedgerRow["paymentStatusVariant"] = "subtle";
    if (entry.status === "rejected") {
      paymentStatusLabel = "Not payable";
    } else if (payable && paid) {
      paymentStatusLabel = `Paid through ${formatOvertimeDate(paidUntilDate ?? workedOn)}`;
      paymentStatusVariant = "green";
    } else if (payable) {
      paymentStatusLabel = "Awaiting payment";
      paymentStatusVariant = "amber";
    }

    const rate = entry.calculationMode === "simple"
      ? entry.fixedHourlyRate ?? null
      : entry.basicMonthlySalary && entry.basicMonthlySalary > 0
        ? entry.basicMonthlySalary / 30 / entry.standardDailyHours
        : null;

    return {
      id: entry.id,
      workerUserId: entry.workerUserId,
      workerName: entry.workerName,
      workedOn,
      startTimeLabel: formatMinutesAsClock(entry.startTimeMinutes),
      endTimeLabel: formatMinutesAsClock(entry.endTimeMinutes),
      overnight: entry.overnight,
      totalWorkedMinutes: effective.workedMinutes,
      totalWorkedLabel: formatMinutesAsHours(effective.workedMinutes),
      overtimeMinutes: effective.overtimeMinutes,
      overtimeLabel: formatMinutesAsHours(effective.overtimeMinutes),
      amount: effective.amount,
      amountLabel: formatCurrency(effective.amount),
      status: entry.status,
      statusLabel: formatOvertimeStatus(entry.status),
      statusVariant: getOvertimeStatusVariant(entry.status),
      notes: entry.notes,
      approvedBy: entry.status === "auto_approved" ? "Auto-approved" : entry.latestApproval?.approverName ?? null,
      approvalComment: entry.latestApproval?.comment ?? null,
      lastDecisionAt: entry.latestApproval
        ? (entry.latestApproval.createdAt instanceof Date ? entry.latestApproval.createdAt.toISOString() : `${entry.latestApproval.createdAt}`)
        : (entry.lastDecisionAt instanceof Date ? entry.lastDecisionAt.toISOString() : entry.lastDecisionAt ? `${entry.lastDecisionAt}` : null),
      paymentStatusLabel,
      paymentStatusVariant,
      paidUntilDate,
      wellbeingWarning: entry.wellbeingWarning,
      calculationSummary: buildCalculationSummary({
        calculationMode: entry.calculationMode,
        overtimeMinutes: entry.overtimeMinutes,
        totalWorkedMinutes: entry.totalWorkedMinutes,
        dayOvertimeMinutes: entry.dayOvertimeMinutes,
        nightOvertimeMinutes: entry.nightOvertimeMinutes,
        rate,
        isWeekend: entry.isWeekend,
        isHoliday: entry.isHoliday,
      }),
      rateDescription: buildRateDescription({
        calculationMode: entry.calculationMode,
        rate,
        isWeekend: entry.isWeekend,
        isHoliday: entry.isHoliday,
        dayOvertimeMinutes: entry.dayOvertimeMinutes,
        nightOvertimeMinutes: entry.nightOvertimeMinutes,
      }),
      isModifiedApproval: effective.modified,
    };
  });
}

export function filterOvertimeRows(rows: OvertimeLedgerRow[], filters: ReturnType<typeof normalizeOvertimeFilters>) {
  return rows.filter((row) => {
    if (filters.from && row.workedOn < filters.from) {
      return false;
    }

    if (filters.to && row.workedOn > filters.to) {
      return false;
    }

    if (filters.status && filters.status !== "all" && row.status !== filters.status) {
      return false;
    }

    if (filters.workerId && filters.workerId !== "all" && row.workerUserId !== filters.workerId) {
      return false;
    }

    return true;
  });
}

export function calculateOvertimeSummary(rows: OvertimeLedgerRow[], referenceDate = new Date()): OvertimeSummary {
  const monthStart = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 1));

  const approvedRows = rows.filter((row) => row.status === "approved" || row.status === "auto_approved");
  const approvedThisMonth = approvedRows.filter((row) => {
    const workedDate = dateFromInput(row.workedOn);
    return workedDate >= monthStart && workedDate < monthEnd;
  });

  return {
    pendingCount: rows.filter((row) => row.status === "pending").length,
    approvedHoursThisMonth: approvedThisMonth.reduce((total, row) => total + row.overtimeMinutes, 0),
    approvedAmountThisMonth: approvedThisMonth.reduce((total, row) => total + row.amount, 0),
    unpaidApprovedCount: approvedRows.filter((row) => row.paymentStatusVariant === "amber").length,
    approvedEntryCountThisMonth: approvedThisMonth.length,
  };
}

export function buildWorkerBreakdown(rows: OvertimeLedgerRow[]) {
  const map = new Map<string, OvertimeWorkerBreakdown>();

  rows.forEach((row) => {
    const existing = map.get(row.workerUserId) ?? {
      workerUserId: row.workerUserId,
      workerName: row.workerName,
      overtimeMinutes: 0,
      amount: 0,
      approvedCount: 0,
      pendingCount: 0,
      paidUntilDate: row.paidUntilDate,
    };

    if (row.status === "approved" || row.status === "auto_approved") {
      existing.overtimeMinutes += row.overtimeMinutes;
      existing.amount += row.amount;
      existing.approvedCount += 1;
    }

    if (row.status === "pending") {
      existing.pendingCount += 1;
    }

    if (!existing.paidUntilDate || (row.paidUntilDate && row.paidUntilDate > existing.paidUntilDate)) {
      existing.paidUntilDate = row.paidUntilDate;
    }

    map.set(row.workerUserId, existing);
  });

  return Array.from(map.values()).sort((left, right) => right.amount - left.amount || left.workerName.localeCompare(right.workerName));
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildOvertimeCsv(rows: OvertimeLedgerRow[]) {
  const headers = [
    "Date",
    "Worker",
    "Start Time",
    "End Time",
    "Total Hours",
    "OT Hours",
    "OT AED",
    "Status",
    "Notes",
    "Approved By",
    "Paid Status",
  ];

  const lines = rows.map((row) => [
    row.workedOn,
    row.workerName,
    row.startTimeLabel,
    row.endTimeLabel,
    (row.totalWorkedMinutes / MINUTES_PER_HOUR).toFixed(2),
    (row.overtimeMinutes / MINUTES_PER_HOUR).toFixed(2),
    row.amount.toFixed(2),
    row.statusLabel,
    row.notes ?? "",
    row.approvedBy ?? "",
    row.paymentStatusLabel,
  ].map((cell) => escapeCsvValue(cell)).join(","));

  return [headers.join(","), ...lines].join("\n");
}