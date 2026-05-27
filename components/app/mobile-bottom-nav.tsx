"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, Home, UserRound, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { matchesAppPath } from "@/lib/app/navigation";

const tabs = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/overtime", label: "Overtime", icon: Clock3 },
  { href: "/app/petty-cash", label: "Cash", icon: Wallet },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/profile", label: "Profile", icon: UserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <div className="relative mx-auto max-w-md">
        <div
          className="mx-3 mb-3 grid grid-cols-5 items-center rounded-2xl border border-border bg-white/95 shadow-elevated backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.map((tab) => (
            <NavTab key={tab.href} {...tab} active={matchesAppPath(pathname, tab.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Clock3;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "tap-highlight relative flex flex-col items-center justify-center gap-0.5 px-2 pb-3 pt-3 text-2xs font-semibold transition",
        active ? "text-primary-700" : "text-text-muted hover:text-text-primary",
      )}
    >
      {active ? (
        <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent-500" aria-hidden="true" />
      ) : null}
      <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
      <span>{label}</span>
    </Link>
  );
}
