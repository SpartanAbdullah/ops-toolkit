"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleUserRound, CreditCard, Home, Menu, PercentCircle, ShieldCheck, Users2 } from "lucide-react";

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

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  email: string;
  roleLabel: string;
  activeTeamName: string | null;
  unreadNotifications: number;
};

const appNavItems = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/petty-cash", label: "Petty Cash", icon: CreditCard },
  { href: "/app/overtime", label: "Overtime", icon: PercentCircle },
  { href: "/app/team", label: "Team", icon: Users2 },
  { href: "/app/profile", label: "Profile", icon: CircleUserRound },
  { href: "/app/settings", label: "Settings", icon: ShieldCheck },
];

function matchesPath(pathname: string, href: string) {
  return href === "/app" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function AppNav({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  return (
    <nav className="grid gap-2">
      {appNavItems.map((item) => {
        const active = matchesPath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-sm font-semibold transition duration-200",
              active
                ? "border-slate-900 bg-slate-950 text-white shadow-sm"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-950",
              mobile ? "bg-slate-50/80" : "",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, userName, email, roleLabel, activeTeamName, unreadNotifications }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(167,139,250,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.98))]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[290px] shrink-0 rounded-[2rem] border border-white/85 bg-white/88 p-5 shadow-card backdrop-blur xl:flex xl:flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200/70 pb-5">
            <IconTile icon={Home} tone="purple" size="lg" />
            <div>
              <p className="font-display text-lg font-semibold text-slate-950">Ops Toolkit</p>
              <p className="text-sm text-slate-500">Private workspace</p>
            </div>
          </div>
          <div className="mt-6 flex-1 space-y-6 overflow-y-auto">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current team</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{activeTeamName ?? "No active team"}</p>
              <p className="mt-1 text-sm text-slate-500">{roleLabel} access across saved modules and team workflows.</p>
            </div>
            <AppNav pathname={pathname} />
          </div>
          <div className="space-y-4 border-t border-slate-200/70 pt-5">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
              <p className="font-semibold text-slate-950">{userName}</p>
              <p className="mt-1 text-sm text-slate-500">{email}</p>
            </div>
            <div className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Bell className="h-4 w-4 text-sky-600" />
                Unread notifications
              </span>
              <span className="font-semibold text-slate-950">{unreadNotifications}</span>
            </div>
            <SignOutButton variant="secondary" className="w-full justify-center" />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="sticky top-4 z-30 rounded-[1.6rem] border border-white/85 bg-white/88 px-4 py-3 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.35)] backdrop-blur md:px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="xl:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open app navigation</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="max-w-[92vw] sm:max-w-sm">
                      <SheetHeader>
                        <div className="flex items-center gap-3">
                          <IconTile icon={Home} tone="purple" />
                          <div>
                            <SheetTitle>Ops Toolkit</SheetTitle>
                            <SheetDescription>Private workspace navigation and account access.</SheetDescription>
                          </div>
                        </div>
                      </SheetHeader>
                      <div className="mt-8 space-y-6">
                        <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                          <p className="font-semibold text-slate-950">{userName}</p>
                          <p className="mt-1 text-sm text-slate-500">{email}</p>
                        </div>
                        <AppNav pathname={pathname} mobile />
                        <div className="rounded-[1.4rem] border border-slate-200/80 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
                          <p className="font-semibold text-slate-950">{activeTeamName ?? "No active team"}</p>
                          <p className="mt-1">{roleLabel} workspace access</p>
                        </div>
                        <SignOutButton variant="secondary" className="w-full justify-center" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                  <p className="truncate text-lg font-semibold text-slate-950">{activeTeamName ?? "Set up your team workspace"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-right lg:block">
                  <p className="text-sm font-semibold text-slate-950">{userName}</p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-2 shadow-sm">
                  <Bell className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-semibold text-slate-900">{unreadNotifications}</span>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}