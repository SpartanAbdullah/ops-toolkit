"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand/brand-mark";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { matchesAppPath, primaryAppNavItems } from "@/lib/app/navigation";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  email: string;
  roleLabel: string;
  activeTeamName: string | null;
  unreadNotifications: number;
};

export function AppShell({ children, userName, email, roleLabel, activeTeamName, unreadNotifications }: AppShellProps) {
  const pathname = usePathname();
  const userInitial = (userName || email).trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-app-background">
      <div className="mx-auto flex w-full max-w-[1280px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-white px-4 py-6 lg:flex">
          <Link href="/app/overtime" className="flex items-center gap-2.5 px-2">
            <BrandMark size={40} className="rounded-xl shadow-card" />
            <div>
              <p className="font-display text-base font-semibold tracking-tight text-text-primary">Ops Toolkit</p>
              <p className="text-2xs uppercase tracking-wide text-text-muted">Interior360 · Field ops</p>
            </div>
          </Link>

          {activeTeamName ? (
            <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-3">
              <p className="text-2xs uppercase tracking-wide text-text-muted">Team</p>
              <p className="mt-0.5 font-display text-sm font-semibold text-text-primary">{activeTeamName}</p>
              <p className="mt-1 text-2xs text-text-muted">{roleLabel} access</p>
            </div>
          ) : (
            <div className="rounded-xl border border-accent-100 bg-accent-50 px-3.5 py-3 text-2xs text-accent-foreground">
              No team yet — visit Team to create or join.
            </div>
          )}

          <nav className="flex-1 space-y-1">
            {primaryAppNavItems.map((item) => {
              const active = matchesAppPath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "tap-highlight flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", active && "stroke-[2.4]")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-white p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 font-display text-sm font-semibold text-primary-700">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{userName}</p>
                  <p className="truncate text-2xs text-text-muted">{email}</p>
                </div>
              </div>
            </div>
            <SignOutButton variant="outline" size="sm" className="w-full" />
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 safe-top">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <BrandMark size={36} className="rounded-xl" />
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold leading-tight text-text-primary">
                    {activeTeamName ?? "Set up your team"}
                  </p>
                  <p className="truncate text-2xs uppercase tracking-wide text-text-muted">{roleLabel}</p>
                </div>
              </div>

              <div className="hidden lg:block" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="tap-highlight relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary-200 hover:text-primary-700"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-2xs font-semibold text-primary-700">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label="Profile"
                  className="tap-highlight inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 font-display text-sm font-semibold text-primary-700 lg:hidden"
                >
                  <Link href="/app/profile" className="flex h-full w-full items-center justify-center">
                    {userInitial}
                  </Link>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-w-0 flex-1 pb-tabbar lg:pb-8">
            <div className="app-page">{children}</div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

// Re-export for convenience in feature pages
export { Badge as ShellBadge, LogOut as ShellLogOut };
