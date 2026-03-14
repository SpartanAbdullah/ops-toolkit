import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getRequiredServerEnv } from "@/lib/env";

export async function createServerSupabaseClient() {
  const env = getRequiredServerEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components may not allow setting cookies during render.
        }
      },
    },
  });
}