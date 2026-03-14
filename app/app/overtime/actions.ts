"use server";

import { Prisma, TeamMemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAppContext } from "@/lib/app/session";
import {
  calculateOvertime,
  formatMinutesAsHours,
  formatOvertimeDate,
  parseDateInputToUtcNoon,
} from "@/lib/overtime";
import { prisma } from "@/lib/prisma";
import {
  overtimeEntrySchema,
  overtimeHolidaySchema,
  overtimePaymentSchema,
  overtimeReviewSchema,
  overtimeSettingsSchema,
  overtimeWorkerCompensationSchema,
  type OvertimeEntryValues,
  type OvertimeHolidayValues,
  type OvertimePaymentValues,
  type OvertimeReviewValues,
  type OvertimeSettingsValues,
  type OvertimeWorkerCompensationValues,
} from "@/lib/validation/overtime";

type ActionResult<TFields extends string = string, TData = undefined> = {
  status: "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<TFields, string>>;
  data?: TData;
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

function parseCurrencyInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalCurrencyInput(value: string) {
  if (!value) {
    return null;
  }
  return parseCurrencyInput(value);
}

function parseDecimalHoursToMinutes(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 60);
}

function ensureAdminMembership(context: Awaited<ReturnType<typeof getAppContext>>) {
  return Boolean(context.activeTeam && context.activeMembership?.role === TeamMemberRole.admin);
}

async function createNotification(userId: string, teamId: string | null, title: string, body: string, type: "info" | "success" | "warning", data?: Prisma.InputJsonValue) {
  await prisma.notification.create({
    data: {
      userId,
      teamId,
      title,
      body,
      type,
      data,
    },
  });
}

async function createTeamAdminSubmissionNotifications(teamId: string, actorUserId: string, workedDate: string) {
  const admins = await prisma.teamMember.findMany({
    where: {
      teamId,
      role: TeamMemberRole.admin,
      userId: {
        not: actorUserId,
      },
    },
    select: {
      userId: true,
    },
  });

  if (!admins.length) {
    return;
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.userId,
      teamId,
      title: "New overtime entry pending",
      body: `A worker submitted a shift for ${formatOvertimeDate(workedDate)} and it is waiting for review.`,
      type: "info",
      data: { module: "overtime" } as Prisma.InputJsonValue,
    })),
  });
}

async function getSettingsForContext(context: Awaited<ReturnType<typeof getAppContext>>) {
  if (context.activeTeam) {
    return prisma.overtimeSettings.findUnique({
      where: {
        teamId: context.activeTeam!.id,
      },
    });
  }

  return prisma.overtimeSettings.findUnique({
    where: {
      ownerUserId: context.user.id,
    },
  });
}

async function getWorkerSalary(teamId: string | null, userId: string, individualSalary: number | null) {
  if (!teamId) {
    return individualSalary;
  }

  const profile = await prisma.overtimeWorkerProfile.findUnique({
    where: {
      teamId_workerUserId: {
        teamId,
        workerUserId: userId,
      },
    },
    select: {
      basicMonthlySalary: true,
    },
  });

  return profile?.basicMonthlySalary ? Number(profile.basicMonthlySalary) : null;
}

async function getHolidayDates(teamId: string | null) {
  if (!teamId) {
    return [] as string[];
  }

  const holidays = await prisma.overtimeHolidayDate.findMany({
    where: { teamId },
    select: { date: true },
  });

  return holidays.map((holiday) => holiday.date.toISOString().slice(0, 10));
}

export async function saveOvertimeSettingsAction(values: OvertimeSettingsValues): Promise<ActionResult<keyof OvertimeSettingsValues>> {
  const parsed = overtimeSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the overtime settings.",
      fieldErrors: getFieldErrors<keyof OvertimeSettingsValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  const isAdmin = ensureAdminMembership(context);
  if (context.activeTeam && !isAdmin) {
    return {
      status: "error",
      message: "Only team admins can update overtime settings.",
    };
  }

  if (!context.activeTeam && parsed.data.calculationMode === "mohre_compliant" && !parsed.data.individualBasicMonthlySalary) {
    return {
      status: "error",
      message: "Add your basic monthly salary to use MOHRE-Compliant Mode as an individual.",
      fieldErrors: {
        individualBasicMonthlySalary: "Basic monthly salary is required for compliant calculations.",
      },
    };
  }

  const settingsData = {
    calculationMode: parsed.data.calculationMode,
    standardDailyHours: parseCurrencyInput(parsed.data.standardDailyHours) ?? 8,
    simpleHourlyRate: parseOptionalCurrencyInput(parsed.data.fixedHourlyRate),
    weekendDays: parsed.data.weekendDays,
    ramadanEnabled: parsed.data.ramadanEnabled,
    ramadanStartDate: parsed.data.ramadanEnabled && parsed.data.ramadanStartDate ? parseDateInputToUtcNoon(parsed.data.ramadanStartDate) : null,
    ramadanEndDate: parsed.data.ramadanEnabled && parsed.data.ramadanEndDate ? parseDateInputToUtcNoon(parsed.data.ramadanEndDate) : null,
    individualBasicMonthlySalary: context.activeTeam ? null : parseOptionalCurrencyInput(parsed.data.individualBasicMonthlySalary),
  };

  await prisma.$transaction(async (tx) => {
    if (context.activeTeam) {
      await tx.overtimeSettings.upsert({
        where: { teamId: context.activeTeam!.id },
        update: settingsData,
        create: {
          teamId: context.activeTeam!.id,
          ...settingsData,
        },
      });
    } else {
      await tx.overtimeSettings.upsert({
        where: { ownerUserId: context.user.id },
        update: settingsData,
        create: {
          ownerUserId: context.user.id,
          ...settingsData,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam?.id,
        actorUserId: context.user.id,
        action: "overtime.settings.updated",
        entityType: "OvertimeSettings",
        summary: context.activeTeam ? "Updated team overtime settings." : "Updated individual overtime settings.",
      },
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/overtime");
  revalidatePath("/app/team");

  return {
    status: "success",
    message: "Overtime settings updated.",
  };
}

export async function addOvertimeHolidayAction(values: OvertimeHolidayValues): Promise<ActionResult<keyof OvertimeHolidayValues>> {
  const parsed = overtimeHolidaySchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the holiday details.",
      fieldErrors: getFieldErrors<keyof OvertimeHolidayValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can manage holiday dates.",
    };
  }

  const holidayDate = parseDateInputToUtcNoon(parsed.data.holidayDate);

  await prisma.$transaction(async (tx) => {
    await tx.overtimeHolidayDate.upsert({
      where: {
        teamId_date: {
          teamId: context.activeTeam!.id,
          date: holidayDate,
        },
      },
      update: {
        label: parsed.data.label.trim() || null,
      },
      create: {
        teamId: context.activeTeam!.id,
        date: holidayDate,
        label: parsed.data.label.trim() || null,
        createdByUserId: context.user.id,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: "overtime.holiday.saved",
        entityType: "OvertimeHolidayDate",
        summary: `Saved holiday date for ${formatOvertimeDate(parsed.data.holidayDate)}.`,
      },
    });
  });

  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: "Holiday date saved.",
  };
}

export async function deleteOvertimeHolidayAction(holidayId: string): Promise<ActionResult> {
  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can remove holiday dates.",
    };
  }

  const existingHoliday = await prisma.overtimeHolidayDate.findFirst({
    where: {
      id: holidayId,
      teamId: context.activeTeam!.id,
    },
  });

  if (!existingHoliday) {
    return {
      status: "error",
      message: "That holiday date could not be found.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.overtimeHolidayDate.delete({
      where: { id: holidayId },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: "overtime.holiday.deleted",
        entityType: "OvertimeHolidayDate",
        entityId: holidayId,
        summary: `Removed holiday date for ${existingHoliday.date.toISOString().slice(0, 10)}.`,
      },
    });
  });

  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: "Holiday date removed.",
  };
}

export async function createOvertimeEntryAction(values: OvertimeEntryValues): Promise<ActionResult<keyof OvertimeEntryValues>> {
  const parsed = overtimeEntrySchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the shift details.",
      fieldErrors: getFieldErrors<keyof OvertimeEntryValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  const settings = await getSettingsForContext(context);
  if (!settings) {
    return {
      status: "error",
      message: "Save overtime settings before logging shifts.",
    };
  }

  const [holidayDates, workerSalary] = await Promise.all([
    getHolidayDates(context.activeTeam?.id ?? null),
    getWorkerSalary(context.activeTeam?.id ?? null, context.user.id, settings.individualBasicMonthlySalary ? Number(settings.individualBasicMonthlySalary) : null),
  ]);

  const calculation = calculateOvertime({
    workedDate: parsed.data.workedDate,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    overnight: parsed.data.overnight,
    calculationMode: settings.calculationMode,
    standardDailyHours: Number(settings.standardDailyHours),
    simpleHourlyRate: settings.simpleHourlyRate ? Number(settings.simpleHourlyRate) : null,
    basicMonthlySalary: workerSalary,
    weekendDays: settings.weekendDays as Parameters<typeof calculateOvertime>[0]["weekendDays"],
    holidayDates,
    ramadanEnabled: settings.ramadanEnabled,
    ramadanStartDate: settings.ramadanStartDate?.toISOString().slice(0, 10) ?? null,
    ramadanEndDate: settings.ramadanEndDate?.toISOString().slice(0, 10) ?? null,
  });

  if (calculation.error) {
    return {
      status: "error",
      message: calculation.error,
    };
  }

  const startTimeParts = parsed.data.startTime.split(":").map(Number);
  const endTimeParts = parsed.data.endTime.split(":").map(Number);
  const startTimeMinutes = (startTimeParts[0] ?? 0) * 60 + (startTimeParts[1] ?? 0);
  const endTimeMinutes = (endTimeParts[0] ?? 0) * 60 + (endTimeParts[1] ?? 0);
  const teamId = context.activeTeam?.id ?? null;
  const status = !teamId || context.resolvedRole === "admin" ? "auto_approved" : "pending";

  await prisma.$transaction(async (tx) => {
    const entry = await tx.overtimeEntry.create({
      data: {
        teamId,
        workerUserId: context.user.id,
        workedDate: parseDateInputToUtcNoon(parsed.data.workedDate),
        startTimeMinutes,
        endTimeMinutes,
        overnight: parsed.data.overnight,
        notes: parsed.data.notes.trim() || null,
        calculationMode: settings.calculationMode,
        standardDailyHours: calculation.standardDailyHoursApplied,
        fixedHourlyRate: settings.simpleHourlyRate ? Number(settings.simpleHourlyRate) : null,
        basicMonthlySalary: workerSalary,
        totalWorkedMinutes: calculation.totalWorkedMinutes,
        overtimeMinutes: calculation.overtimeMinutes,
        dayOvertimeMinutes: calculation.dayOvertimeMinutes,
        nightOvertimeMinutes: calculation.nightOvertimeMinutes,
        calculatedOvertimeAmount: calculation.amount,
        isWeekend: calculation.isWeekend,
        isHoliday: calculation.isHoliday,
        ramadanApplied: calculation.ramadanApplied,
        wellbeingWarning: Boolean(calculation.wellbeingWarning),
        status,
        approvedWorkedMinutes: status === "auto_approved" ? calculation.totalWorkedMinutes : null,
        approvedOvertimeMinutes: status === "auto_approved" ? calculation.overtimeMinutes : null,
        approvedOvertimeAmount: status === "auto_approved" ? calculation.amount : null,
        lastDecisionAt: status === "auto_approved" ? new Date() : null,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId,
        actorUserId: context.user.id,
        action: "overtime.entry.created",
        entityType: "OvertimeEntry",
        entityId: entry.id,
        summary: `Logged ${formatMinutesAsHours(calculation.overtimeMinutes)} for ${formatOvertimeDate(parsed.data.workedDate)}.`,
      },
    });
  });

  if (teamId && status === "pending") {
    await createTeamAdminSubmissionNotifications(teamId, context.user.id, parsed.data.workedDate);
  }

  revalidatePath("/app");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: status === "pending" ? "Shift saved and sent for approval." : "Shift saved and auto-approved.",
  };
}

export async function approveOvertimeEntryQuickAction(entryId: string): Promise<ActionResult> {
  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can approve overtime entries.",
    };
  }

  const entry = await prisma.overtimeEntry.findFirst({
    where: {
      id: entryId,
      teamId: context.activeTeam!.id,
    },
    include: {
      worker: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!entry) {
    return {
      status: "error",
      message: "That overtime entry could not be found.",
    };
  }

  if (entry.status !== "pending") {
    return {
      status: "error",
      message: "Only pending entries can be approved from the queue.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.overtimeEntry.update({
      where: { id: entry.id },
      data: {
        status: "approved",
        approvedWorkedMinutes: entry.totalWorkedMinutes,
        approvedOvertimeMinutes: entry.overtimeMinutes,
        approvedOvertimeAmount: entry.calculatedOvertimeAmount,
        lastDecisionAt: new Date(),
      },
    });

    await tx.overtimeApproval.create({
      data: {
        entryId: entry.id,
        approverUserId: context.user.id,
        decision: "approved",
        approvedWorkedMinutes: entry.totalWorkedMinutes,
        approvedOvertimeMinutes: entry.overtimeMinutes,
        approvedOvertimeAmount: entry.calculatedOvertimeAmount,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: "overtime.entry.approved",
        entityType: "OvertimeEntry",
        entityId: entry.id,
        summary: `Approved overtime entry for ${entry.worker.profile?.fullName || entry.worker.email}.`,
      },
    });
  });

  await createNotification(
    entry.workerUserId,
    context.activeTeam!.id,
    "Overtime approved",
    `Your shift for ${formatOvertimeDate(entry.workedDate.toISOString().slice(0, 10))} was approved.`,
    "success",
    { module: "overtime", entryId: entry.id },
  );

  revalidatePath("/app");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: "Entry approved.",
  };
}

export async function reviewOvertimeEntryAction(entryId: string, values: OvertimeReviewValues): Promise<ActionResult<keyof OvertimeReviewValues>> {
  const parsed = overtimeReviewSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the approval form.",
      fieldErrors: getFieldErrors<keyof OvertimeReviewValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can review overtime entries.",
    };
  }

  const entry = await prisma.overtimeEntry.findFirst({
    where: {
      id: entryId,
      teamId: context.activeTeam!.id,
    },
    include: {
      worker: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!entry) {
    return {
      status: "error",
      message: "That overtime entry could not be found.",
    };
  }

  if (entry.status !== "pending") {
    return {
      status: "error",
      message: "Only pending entries can be reviewed.",
    };
  }

  const approvedWorkedMinutes = parsed.data.decision === "rejected" ? null : parseDecimalHoursToMinutes(parsed.data.approvedWorkedHours);
  const approvedOvertimeMinutes = parsed.data.decision === "rejected" ? null : parseDecimalHoursToMinutes(parsed.data.approvedOvertimeHours);
  const approvedAmount = parsed.data.decision === "rejected" ? null : parseCurrencyInput(parsed.data.approvedAmount);
  if (parsed.data.decision !== "rejected" && (approvedWorkedMinutes === null || approvedOvertimeMinutes === null || approvedAmount === null)) {
    return {
      status: "error",
      message: "Approved values are incomplete.",
    };
  }

  const nextStatus = parsed.data.decision === "rejected" ? "rejected" : "approved";

  await prisma.$transaction(async (tx) => {
    await tx.overtimeEntry.update({
      where: { id: entry.id },
      data: {
        status: nextStatus,
        approvedWorkedMinutes,
        approvedOvertimeMinutes,
        approvedOvertimeAmount: approvedAmount,
        lastDecisionAt: new Date(),
      },
    });

    await tx.overtimeApproval.create({
      data: {
        entryId: entry.id,
        approverUserId: context.user.id,
        decision: parsed.data.decision,
        comment: parsed.data.comment.trim() || null,
        approvedWorkedMinutes,
        approvedOvertimeMinutes,
        approvedOvertimeAmount: approvedAmount,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: parsed.data.decision === "rejected" ? "overtime.entry.rejected" : "overtime.entry.reviewed",
        entityType: "OvertimeEntry",
        entityId: entry.id,
        summary: parsed.data.decision === "rejected"
          ? `Rejected overtime entry for ${entry.worker.profile?.fullName || entry.worker.email}.`
          : `Reviewed overtime entry for ${entry.worker.profile?.fullName || entry.worker.email}.`,
      },
    });
  });

  const workedDateLabel = formatOvertimeDate(entry.workedDate.toISOString().slice(0, 10));
  if (parsed.data.decision === "rejected") {
    await createNotification(
      entry.workerUserId,
      context.activeTeam!.id,
      "Overtime rejected",
      `Your shift for ${workedDateLabel} was rejected. ${parsed.data.comment ? `Reason: ${parsed.data.comment}` : ""}`.trim(),
      "warning",
      { module: "overtime", entryId: entry.id },
    );
  } else {
    await createNotification(
      entry.workerUserId,
      context.activeTeam!.id,
      "Overtime approved",
      `Your shift for ${workedDateLabel} was approved${parsed.data.decision === "partially_approved" ? " with adjusted values" : ""}.`,
      "success",
      { module: "overtime", entryId: entry.id },
    );
  }

  revalidatePath("/app");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: parsed.data.decision === "rejected" ? "Entry rejected." : "Entry reviewed and saved.",
  };
}

export async function saveOvertimeWorkerCompensationAction(values: OvertimeWorkerCompensationValues): Promise<ActionResult<keyof OvertimeWorkerCompensationValues>> {
  const parsed = overtimeWorkerCompensationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the worker pay details.",
      fieldErrors: getFieldErrors<keyof OvertimeWorkerCompensationValues>(parsed.error),
    };
  }

  const salary = parseCurrencyInput(parsed.data.basicMonthlySalary);
  if (salary === null || salary <= 0) {
    return {
      status: "error",
      message: "Enter a valid basic monthly salary.",
      fieldErrors: {
        basicMonthlySalary: "Basic monthly salary must be greater than zero.",
      },
    };
  }

  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can manage worker salaries.",
    };
  }

  const member = await prisma.teamMember.findFirst({
    where: {
      teamId: context.activeTeam!.id,
      userId: parsed.data.workerUserId,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!member) {
    return {
      status: "error",
      message: "That worker is not part of the active team.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.overtimeWorkerProfile.upsert({
      where: {
        teamId_workerUserId: {
          teamId: context.activeTeam!.id,
          workerUserId: parsed.data.workerUserId,
        },
      },
      update: {
        basicMonthlySalary: salary,
      },
      create: {
        teamId: context.activeTeam!.id,
        workerUserId: parsed.data.workerUserId,
        basicMonthlySalary: salary,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: "overtime.worker_profile.updated",
        entityType: "OvertimeWorkerProfile",
        entityId: parsed.data.workerUserId,
        summary: `Updated compensation profile for ${member.user.profile?.fullName || member.user.email}.`,
      },
    });
  });

  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: "Worker salary saved.",
  };
}

export async function markOvertimePaymentAction(values: OvertimePaymentValues): Promise<ActionResult<keyof OvertimePaymentValues>> {
  const parsed = overtimePaymentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the payment update.",
      fieldErrors: getFieldErrors<keyof OvertimePaymentValues>(parsed.error),
    };
  }

  const context = await getAppContext();
  if (!ensureAdminMembership(context) || !context.activeTeam) {
    return {
      status: "error",
      message: "Only team admins can mark payments.",
    };
  }

  const member = await prisma.teamMember.findFirst({
    where: {
      teamId: context.activeTeam!.id,
      userId: parsed.data.workerUserId,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!member) {
    return {
      status: "error",
      message: "That worker is not part of the active team.",
    };
  }

  const paidUntilDate = parseDateInputToUtcNoon(parsed.data.paidUntilDate);

  await prisma.$transaction(async (tx) => {
    await tx.overtimePaymentRecord.create({
      data: {
        teamId: context.activeTeam!.id,
        workerUserId: parsed.data.workerUserId,
        markedByUserId: context.user.id,
        paidUntilDate,
        note: parsed.data.note.trim() || null,
      },
    });

    await tx.auditLog.create({
      data: {
        teamId: context.activeTeam!.id,
        actorUserId: context.user.id,
        action: "overtime.payment.marked",
        entityType: "OvertimePaymentRecord",
        entityId: parsed.data.workerUserId,
        summary: `Marked overtime paid through ${parsed.data.paidUntilDate} for ${member.user.profile?.fullName || member.user.email}.`,
      },
    });
  });

  await createNotification(
    parsed.data.workerUserId,
    context.activeTeam!.id,
    "Overtime payment updated",
    `Your overtime has been marked paid through ${formatOvertimeDate(parsed.data.paidUntilDate)}.`,
    "success",
    { module: "overtime", paidUntilDate: parsed.data.paidUntilDate },
  );

  revalidatePath("/app");
  revalidatePath("/app/overtime");

  return {
    status: "success",
    message: "Payment status updated.",
  };
}