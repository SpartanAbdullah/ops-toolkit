import Link from "next/link";
import { Suspense } from "react";
import { Boxes } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({ title: "Sign in" });

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-app-background">
      <div className="grid-noise relative flex flex-1 items-center justify-center px-4 py-10 safe-top">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Link href="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-elevated">
              <Boxes className="h-6 w-6" />
            </Link>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">Welcome back</h1>
              <p className="text-sm text-text-secondary">Sign in to your workspace</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <Suspense
              fallback={<div className="h-48 animate-pulse rounded-xl bg-surface-muted" />}
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-2xs text-text-muted">
            Ops Toolkit · Built for UAE operations teams
          </p>
        </div>
      </div>
    </div>
  );
}
