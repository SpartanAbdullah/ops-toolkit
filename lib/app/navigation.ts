import type { LucideIcon } from "lucide-react";
import { Clock3, Users, UserRound, Wallet } from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const primaryAppNavItems: AppNavItem[] = [
  { href: "/app/overtime", label: "Overtime", icon: Clock3, description: "Log shifts, approve, pay" },
  { href: "/app/petty-cash", label: "Cash", icon: Wallet, description: "Ledger and reimbursements" },
  { href: "/app/team", label: "Team", icon: Users, description: "Members and invites" },
  { href: "/app/profile", label: "Profile", icon: UserRound, description: "Your account" },
];

export function matchesAppPath(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveAppItem(pathname: string) {
  return primaryAppNavItems.find((item) => matchesAppPath(pathname, item.href));
}
