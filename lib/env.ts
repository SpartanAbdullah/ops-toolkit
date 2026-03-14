import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_KEY: z.string().min(1),
});

const serverEnvSchema = clientEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;
type ServerEnv = z.infer<typeof serverEnvSchema>;

function resolveSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getOptionalClientEnv(): ClientEnv | null {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: resolveSupabaseKey(),
  });

  return parsed.success ? parsed.data : null;
}

export function getRequiredServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: resolveSupabaseKey(),
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!parsed.success) {
    throw new Error("Missing required Supabase or database environment variables.");
  }

  return parsed.data;
}