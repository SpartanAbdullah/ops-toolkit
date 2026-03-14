"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }

  return next;
}

export function GoogleAuthButton({ nextPath, label }: { nextPath?: string | null; label?: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    setIsPending(true);
    const safeNext = getSafeNext(nextPath);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    setIsPending(false);
  }

  return (
    <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleSignIn} disabled={isPending}>
      <Chrome className="h-4 w-4" />
      {isPending ? "Connecting" : label ?? "Continue with Google"}
    </Button>
  );
}