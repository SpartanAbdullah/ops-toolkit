"use client";

import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthStatusActions({ mobile = false }: { mobile?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className={mobile ? "h-11 rounded-[1.2rem] border border-slate-200/80 bg-slate-100/80" : "h-11 w-52 rounded-[1.2rem] border border-slate-200/80 bg-slate-100/80"} />;
  }

  if (!user) {
    if (mobile) {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    );
  }

  const identity = user.user_metadata.full_name || user.email || "Workspace";

  if (mobile) {
    return (
      <div className="space-y-3">
        <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">{identity}</p>
          <p className="mt-1 text-sm text-slate-500">Signed in and ready to continue.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="w-full">
            <Link href="/app">Open app</Link>
          </Button>
          <SignOutButton variant="secondary" className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden rounded-[1rem] border border-slate-200/80 bg-white/92 px-4 py-2 text-right shadow-sm xl:block">
        <div className="text-sm font-semibold text-slate-900">{identity}</div>
        <div className="text-xs text-slate-500">Signed in</div>
      </div>
      <Button asChild variant="secondary">
        <Link href="/app">Open app</Link>
      </Button>
      <SignOutButton variant="ghost" />
    </div>
  );
}