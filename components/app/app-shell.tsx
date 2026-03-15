"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Package2 } from "lucide-react";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  getActiveAppIcon,
  getActiveAppLabel,
  matchesAppPath,
  primaryAppNavItems,
  secondaryAppNavItems,
} from "@/lib/app/navigation";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  email: string;
  roleLabel: string;
  activeTeamName: string | null;
  unreadNotifications: number;
};

function NavSection({
  pathname,
  items,
  compact = false,
}: {
  pathname: string;
  items: typeof primaryAppNavItems;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-2">
      {items.map((item) => {
        const active = matchesAppPath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "tap-highlight flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              active ? "bg-primary-50 text-primary-700" : "text-text-secondary hover:bg-slate-50 hover:text-text-primary",
              compact ? "bg-white" : "",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children, userName, email, roleLabel, activeTeamName, unreadNotifications }: AppShellProps) {
  const pathname = usePathname();
  const currentLabel = getActiveAppLabel(pathname);
  const ActiveIcon = getActiveAppIcon(pathname);

  return (
    <div className="page-surface min-h-screen bg-app-background">
      <header className="safe-top sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="max-w-[92vw]">
                  <SheetHeader>
                    <div className="flex items-center gap-3">
                      <IconTile icon={Package2} tone="blue" />
                      <div>
                        <SheetTitle>Ops Toolkit</SheetTitle>
                        <SheetDescription>Fast access for field operations, OT, cash, and reports.</SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="mt-6 space-y-6 overflow-y-auto pb-6">
                    <div className="rounded-3xl border border-border bg-primary-50 p-4">
                      <p className="section-label">Current workspace</p>
                      <p className="mt-2 text-lg font-semibold text-text-primary">{activeTeamName ?? "No team selected"}</p>
                      <p className="mt-1 text-sm text-text-secondary">{roleLabel} access</p>
                    </div>
                    <div className="space-y-3">
                      <p className="section-label">Main</p>
                      <NavSection pathname={pathname} items={primaryAppNavItems} compact />
                    </div>
                    <div className="space-y-3">
                      <p className="section-label">More</p>
                      <NavSection pathname={pathname} items={secondaryAppNavItems} compact />
                    </div>
                    <div className="rounded-3xl border border-border bg-white p-4">
                      <p className="font-semibold text-text-primary">{userName}</p>
                      <p className="mt-1 text-sm text-text-secondary">{email}</p>
                    </div>
                    <SignOutButton variant="secondary" className="w-full justify-center" />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <IconTile icon={ActiveIcon} tone="blue" size="sm" className="hidden sm:inline-flex" />
            <div className="min-w-0">
              <p className="section-label">Workspace</p>
              <p className="truncate text-base font-semibold text-text-primary sm:text-lg">{currentLabel}</p>
              <p className="truncate text-sm text-text-secondary">{activeTeamName ?? "Set up your team workspace"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-2xl border border-border bg-white px-4 py-2 text-right md:block">
              <p className="text-sm font-semibold text-text-primary">{userName}</p>
              <p className="text-xs text-text-muted">{roleLabel}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text-primary shadow-sm">
              <Bell className="h-4 w-4 text-primary-700" />
              <span className="font-semibold">{unreadNotifications}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <IconTile icon={Package2} tone="blue" size="md" />
                <div>
                  <p className="text-lg font-semibold text-text-primary">Ops Toolkit</p>
                  <p className="text-sm text-text-secondary">Field-ready workspace</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-primary-50 p-4">
                <p className="section-label">Team</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">{activeTeamName ?? "No team selected"}</p>
                <p className="mt-1 text-sm text-text-secondary">{roleLabel} access</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4 shadow-card">
              <p className="section-label px-2 pb-2">Main</p>
              <NavSection pathname={pathname} items={primaryAppNavItems} />
              <div className="mt-4 border-t border-border pt-4">
                <p className="section-label px-2 pb-2">More</p>
                <NavSection pathname={pathname} items={secondaryAppNavItems} />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4 shadow-card">
              <p className="font-semibold text-text-primary">{userName}</p>
              <p className="mt-1 text-sm text-text-secondary">{email}</p>
              <SignOutButton variant="secondary" className="mt-4 w-full justify-center" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 pb-28 lg:pb-6">
          <div className="app-page">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
