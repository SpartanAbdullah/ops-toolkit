import { z } from "zod";

import { overtimeSettingsSchema } from "@/lib/validation/overtime";

function normalizeJoinCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

const teamOvertimeSetupSchema = overtimeSettingsSchema.omit({
  individualBasicMonthlySalary: true,
});

export const createTeamSchema = teamOvertimeSetupSchema.extend({
  name: z.string().trim().min(2, "Enter a team name.").max(80, "Keep the name under 80 characters."),
});

export const joinTeamSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((value) => normalizeJoinCode(value))
    .refine((value) => value.length === 6, "Join codes must be 6 characters."),
});

export type CreateTeamValues = z.infer<typeof createTeamSchema>;
export type JoinTeamValues = z.infer<typeof joinTeamSchema>;