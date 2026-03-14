"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton({ variant = "ghost", size = "default", className }: Pick<ButtonProps, "variant" | "size" | "className">) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      return;
    }

    setIsPending(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setIsPending(false);
  }

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleSignOut} disabled={isPending}>
      <LogOut className="h-4 w-4" />
      {isPending ? "Logging out" : "Logout"}
    </Button>
  );
}