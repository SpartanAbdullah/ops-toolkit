"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, Plus, Users, UserRound, Wallet } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { matchesAppPath } from "@/lib/app/navigation";

const tabs = [
  { href: "/app/overtime", label: "Overtime", icon: Clock3 },
  { href: "/app/petty-cash", label: "Cash", icon: Wallet },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/profile", label: "Profile", icon: UserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <div className="relative mx-auto max-w-md">
        <div
          className="mx-3 mb-3 grid grid-cols-5 items-center rounded-2xl border border-border bg-white/95 shadow-elevated backdrop-blur supports-[backdrop-filter]:bg-white/90"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.slice(0, 2).map((tab) => (
            <NavTab key={tab.href} {...tab} active={matchesAppPath(pathname, tab.href)} />
          ))}

          <div className="relative -mt-7 flex justify-center">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="tap-highlight inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-primary-700 shadow-fab transition active:scale-95 hover:bg-accent-600 hover:text-white"
                  aria-label="Quick add"
                >
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <div className="space-y-5 px-5 pb-6 pt-6 sm:px-6">
                  <SheetHeader>
                    <SheetTitle>Quick add</SheetTitle>
                    <SheetDescription>Pick what you want to log right now.</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-3">
                    <QuickAction
                      title="Log overtime shift"
                      description="Enter shift times, see the AED preview, send for approval."
                      icon={Clock3}
                      tone="accent"
                      onClick={() => router.push("/app/overtime?action=log")}
                    />
                    <QuickAction
                      title="Add petty cash entry"
                      description="Top-up, expense, reimbursement, or adjustment."
                      icon={Wallet}
                      tone="mint"
                      onClick={() => router.push("/app/petty-cash?action=add")}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {tabs.slice(2).map((tab) => (
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
        "tap-highlight flex flex-col items-center justify-center gap-0.5 px-2 pb-3 pt-3 text-2xs font-semibold transition",
        active ? "text-primary-700" : "text-text-muted hover:text-text-primary",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
      <span>{label}</span>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  icon: Icon,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  icon: typeof Clock3;
  tone: "accent" | "mint";
  onClick: () => void;
}) {
  const toneStyles = {
    accent: "bg-accent-500 text-primary-700",
    mint: "bg-mint-500 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-highlight flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left transition active:scale-[0.98] hover:border-primary-200 hover:bg-primary-50"
    >
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", toneStyles[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 space-y-0.5">
        <span className="block font-display text-base font-semibold text-text-primary">{title}</span>
        <span className="block text-sm leading-5 text-text-secondary">{description}</span>
      </span>
    </button>
  );
}
