"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChevronDown } from "lucide-react";

import { AuthStatusActions } from "@/components/layout/auth-status-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import { solutionNavGroups, toolNavGroups } from "@/lib/content";

function navItemClasses(active: boolean) {
  return cn(
    "inline-flex items-center gap-1 rounded-[1rem] px-3.5 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
    active ? "bg-slate-950 text-white shadow-sm" : "text-slate-700 hover:bg-white/90 hover:text-slate-950",
  );
}

function DropdownGroup({
  label,
  href,
  items,
  active,
}: {
  label: string;
  href: string;
  items: { label: string; href: string; description: string }[];
  active: boolean;
}) {
  return (
    <div className="group relative hidden lg:block">
      <Link href={href} className={navItemClasses(active)}>
        {label}
        <ChevronDown className={cn("h-4 w-4 transition", active ? "text-white/80" : "text-slate-400", "group-hover:rotate-180 group-focus-within:rotate-180")} />
      </Link>
      <div className="pointer-events-none absolute left-0 top-full z-30 w-[460px] pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="rounded-[1.75rem] border border-white/85 bg-white/95 p-3 shadow-soft backdrop-blur-xl">
          <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Browse by area</p>
            <p className="mt-1 text-sm text-slate-600">Keep discovery clear and move directly into the right workflow.</p>
          </div>
          <div className="mt-3 grid gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.2rem] border border-transparent px-4 py-3 transition hover:border-sky-100 hover:bg-sky-50/60"
              >
                <div className="font-semibold text-slate-900">{item.label}</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 py-3 md:py-4">
      <div className="container">
        <div className="flex items-center justify-between gap-6 rounded-[1.6rem] border border-white/85 bg-white/78 px-4 py-3 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl md:px-5">
          <div className="flex min-w-0 items-center gap-6 xl:gap-8">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-sky-200/90 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 text-sky-700 shadow-sm">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold tracking-tight text-slate-950">Ops Toolkit</div>
                <div className="text-xs text-slate-500">Focused operations utilities</div>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              <DropdownGroup label="Tools" href="/tools" items={toolNavGroups} active={pathname.startsWith("/tools")} />
              <DropdownGroup label="Solutions / Use Cases" href="/solutions" items={solutionNavGroups} active={pathname.startsWith("/solutions")} />
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={navItemClasses(pathname === item.href)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <AuthStatusActions />
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}