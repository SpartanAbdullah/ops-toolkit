import { z } from "zod";

import {
  overtimeCalculationModes,
  overtimeReviewDecisions,
  weekendDayOptions,
} from "@/lib/overtime";

const calculationModeValues = overtimeCalculationModes.map((mode) => mode.value) as [
  (typeof overtimeCalculationModes)[number]["value"],
  ...Array<(typeof overtimeCalculationModes)[number]["value"]>,
];

const weekendDayValues = weekendDayOptions.map((day) => day.value) as [
  (typeof weekendDayOptions)[number]["value"],
  ...Array<(typeof weekendDayOptions)[number]["value"]>,
];

const reviewDecisionValues = overtimeReviewDecisions.map((decision) => decision.value) as [
  (typeof overtimeReviewDecisions)[number]["value"],
  ...Array<(typeof overtimeReviewDecisions)[number]["value"]>,
];

function isValidDateInput(value: string) {
  return !Number.isNaN(new Date(`${value}T12:00:00.000Z`).getTime());
}

function isValidTimeInput(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const overtimeSettingsSchema = z
  .object({
    calculationMode: z.enum(calculationModeValues),
    standardDailyHours: z.string().trim().min(1, "Enter the standard daily hours."),
    fixedHourlyRate: z.string().trim().or(z.literal("")),
    weekendDays: z.array(z.enum(weekendDayValues)).min(1, "Choose at least one weekend day."),
    ramadanEnabled: z.boolean(),
    ramadanStartDate: z.string().trim().or(z.literal("")),
    ramadanEndDate: z.string().trim().or(z.literal("")),
    individualBasicMonthlySalary: z.string().trim().or(z.literal("")),
  })
  .superRefine((values, context) => {
    const standardDailyHours = parseNumber(values.standardDailyHours);
    if (standardDailyHours === null || standardDailyHours <= 0 || standardDailyHours > 24) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["standardDailyHours"],
        message: "Enter a daily hours value between 0 and 24.",
      });
    }

    if (values.calculationMode === "simple") {
      const fixedHourlyRate = parseNumber(values.fixedHourlyRate);
      if (fixedHourlyRate === null || fixedHourlyRate <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fixedHourlyRate"],
          message: "Enter the fixed AED per hour rate for Simple Mode.",
        });
      }
    }

    if (values.individualBasicMonthlySalary) {
      const salary = parseNumber(values.individualBasicMonthlySalary);
      if (salary === null || salary <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["individualBasicMonthlySalary"],
          message: "Enter a valid basic monthly salary.",
        });
      }
    }

    if (values.ramadanEnabled) {
      if (!values.ramadanStartDate || !isValidDateInput(values.ramadanStartDate)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ramadanStartDate"],
          message: "Choose the Ramadan start date.",
        });
      }

      if (!values.ramadanEndDate || !isValidDateInput(values.ramadanEndDate)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ramadanEndDate"],
          message: "Choose the Ramadan end date.",
        });
      }

      if (values.ramadanStartDate && values.ramadanEndDate && values.ramadanStartDate > values.ramadanEndDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ramadanEndDate"],
          message: "Ramadan end date must be after the start date.",
        });
      }
    }
  });

export const overtimeHolidaySchema = z.object({
  holidayDate: z.string().trim().min(1, "Choose a holiday date.").refine((value) => isValidDateInput(value), "Choose a valid holiday date."),
  label: z.string().trim().max(60, "Keep the holiday label under 60 characters.").or(z.literal("")),
});

export const overtimeEntrySchema = z
  .object({
    workedDate: z.string().trim().min(1, "Choose the shift date."),
    startTime: z.string().trim().min(1, "Choose the shift start time."),
    endTime: z.string().trim().min(1, "Choose the shift end time."),
    overnight: z.boolean(),
    notes: z.string().trim().max(500, "Keep the notes under 500 characters.").or(z.literal("")),
  })
  .superRefine((values, context) => {
    if (!isValidDateInput(values.workedDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workedDate"],
        message: "Choose a valid shift date.",
      });
    }

    if (!isValidTimeInput(values.startTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Choose a valid start time.",
      });
    }

    if (!isValidTimeInput(values.endTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Choose a valid end time.",
      });
    }
  });

export const overtimeReviewSchema = z
  .object({
    decision: z.enum(reviewDecisionValues),
    approvedWorkedHours: z.string().trim().or(z.literal("")),
    approvedOvertimeHours: z.string().trim().or(z.literal("")),
    approvedAmount: z.string().trim().or(z.literal("")),
    comment: z.string().trim().max(400, "Keep the comment under 400 characters.").or(z.literal("")),
  })
  .superRefine((values, context) => {
    if (values.decision === "rejected") {
      if (!values.comment || values.comment.length < 4) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["comment"],
          message: "Add a short rejection reason for the worker.",
        });
      }
      return;
    }

    const workedHours = parseNumber(values.approvedWorkedHours);
    const overtimeHours = parseNumber(values.approvedOvertimeHours);
    const approvedAmount = parseNumber(values.approvedAmount);

    if (workedHours === null || workedHours <= 0 || workedHours > 24) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvedWorkedHours"],
        message: "Enter approved worked hours between 0 and 24.",
      });
    }

    if (overtimeHours === null || overtimeHours < 0 || overtimeHours > 24) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvedOvertimeHours"],
        message: "Enter approved overtime hours between 0 and 24.",
      });
    }

    if (workedHours !== null && overtimeHours !== null && overtimeHours > workedHours) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvedOvertimeHours"],
        message: "Approved overtime cannot exceed approved worked hours.",
      });
    }

    if (approvedAmount === null || approvedAmount < 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvedAmount"],
        message: "Enter a valid approved AED amount.",
      });
    }
  });

export const overtimeWorkerCompensationSchema = z.object({
  workerUserId: z.string().uuid("Choose a valid team member."),
  basicMonthlySalary: z.string().trim().min(1, "Enter the worker basic monthly salary."),
});

export const overtimePaymentSchema = z.object({
  workerUserId: z.string().uuid("Choose a valid worker."),
  paidUntilDate: z.string().trim().min(1, "Choose the paid-until date.").refine((value) => isValidDateInput(value), "Choose a valid paid-until date."),
  note: z.string().trim().max(250, "Keep the note under 250 characters.").or(z.literal("")),
});

export type OvertimeSettingsValues = z.infer<typeof overtimeSettingsSchema>;
export type OvertimeHolidayValues = z.infer<typeof overtimeHolidaySchema>;
export type OvertimeEntryValues = z.infer<typeof overtimeEntrySchema>;
export type OvertimeReviewValues = z.infer<typeof overtimeReviewSchema>;
export type OvertimeWorkerCompensationValues = z.infer<typeof overtimeWorkerCompensationSchema>;
export type OvertimePaymentValues = z.infer<typeof overtimePaymentSchema>;