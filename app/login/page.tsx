import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/brand/brand-mark";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({ title: "Sign in" });

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-app-background">
      <div className="grid-noise relative flex flex-1 items-center justify-center px-4 py-10 safe-top">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link href="/" className="relative inline-flex">
              <span
                aria-hidden="true"
                className="absolute inset-0 -m-2 rounded-3xl blur-xl"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)" }}
              />
              <BrandMark size={64} className="relative rounded-2xl shadow-elevated" />
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

          <div className="space-y-1 text-center text-2xs text-text-muted">
            <p>Ops Toolkit · Built for UAE operations teams</p>
            <p className="flex justify-center gap-3">
              <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms" className="hover:text-text-primary">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
