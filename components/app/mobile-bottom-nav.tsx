"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { matchesAppPath, primaryAppNavItems } from "@/lib/app/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-[560px] grid-cols-4 px-2 py-2">
        {primaryAppNavItems.map((item) => {
          const active = matchesAppPath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "tap-highlight flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                active ? "bg-primary-50 text-primary-700" : "text-text-muted hover:bg-slate-50 hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {active ? <Badge variant="blue" className="px-2 py-0.5 text-[10px]">Now</Badge> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
