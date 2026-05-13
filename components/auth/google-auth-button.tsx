"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function getSafeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }

  return next;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.49-1.13 2.75-2.41 3.6v3h3.89c2.27-2.09 3.57-5.19 3.57-8.84z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.1-6.68-4.93H1.3v3.09C3.27 21.31 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.59H1.3C.47 8.24 0 10.06 0 12s.47 3.76 1.3 5.41l4.02-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.33.61 4.57 1.79l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.27 2.69 1.3 6.59l4.02 3.09C6.26 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}

export function GoogleAuthButton({ nextPath, label }: { nextPath?: string | null; label?: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleGoogleSignIn() {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;

    setIsPending(true);
    const safeNext = getSafeNext(nextPath);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setIsPending(false);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isPending}
    >
      <GoogleIcon className="h-4 w-4" />
      {isPending ? "Connecting..." : label ?? "Continue with Google"}
    </Button>
  );
}
