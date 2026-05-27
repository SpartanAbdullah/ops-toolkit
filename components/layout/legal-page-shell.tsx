import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";

export function LegalPageShell({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-app-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark size={36} className="rounded-xl" />
            <span className="font-display text-base font-semibold text-text-primary">Ops Toolkit</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 px-5 py-8 sm:px-6">
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-1.5">
            <p className="text-2xs uppercase tracking-[0.18em] text-text-muted">Legal</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{title}</h1>
            <p className="text-sm text-text-muted">Effective {effectiveDate}</p>
          </div>
          <div className="legal-prose space-y-5 text-[15px] leading-7 text-text-secondary">
            {children}
          </div>
        </article>
      </main>
      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-2xs text-text-muted sm:px-6">
          <span>© Interior360</span>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-text-primary">Terms</Link>
            <Link href="/login" className="hover:text-text-primary">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
