"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getOptionalClientEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient() {
  const env = getOptionalClientEnv();

  if (!env) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  return browserClient;
}