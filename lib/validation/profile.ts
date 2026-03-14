import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter a name.").max(80, "Keep the name under 80 characters."),
  phone: z
    .string()
    .trim()
    .max(24, "Keep the phone number under 24 characters.")
    .regex(/^[+()\-\s\d]*$/, "Use digits and common phone symbols only.")
    .or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;