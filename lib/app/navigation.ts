import type { LucideIcon } from "lucide-react";
import { BarChart3, CreditCard, Home, PercentCircle, Settings, ShieldCheck, UserRound, Users2 } from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const primaryAppNavItems: AppNavItem[] = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/overtime", label: "OT", icon: PercentCircle },
  { href: "/app/petty-cash", label: "Cash", icon: CreditCard },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
];

export const secondaryAppNavItems: AppNavItem[] = [
  { href: "/app/team", label: "Teams", icon: Users2 },
  { href: "/app/profile", label: "Profile", icon: UserRound },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function matchesAppPath(pathname: string, href: string) {
  return href === "/app" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveAppLabel(pathname: string) {
  const match = [...primaryAppNavItems, ...secondaryAppNavItems].find((item) => matchesAppPath(pathname, item.href));
  return match?.label ?? "Workspace";
}

export function getActiveAppIcon(pathname: string) {
  const match = [...primaryAppNavItems, ...secondaryAppNavItems].find((item) => matchesAppPath(pathname, item.href));
  return match?.icon ?? ShieldCheck;
}
