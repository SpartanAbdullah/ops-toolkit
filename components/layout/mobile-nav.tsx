"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Boxes, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { solutionNavGroups, toolNavGroups } from "@/lib/content";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-[92vw] sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-sky-200 bg-sky-50 text-sky-700 shadow-sm">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>Ops Toolkit</SheetTitle>
              <SheetDescription>Focused operational utilities for daily work.</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="mt-8 space-y-8 overflow-y-auto pb-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Main</p>
            <div className="grid gap-2">
              {[
                { href: "/tools", label: "Tools" },
                { href: "/solutions", label: "Solutions" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    className={cn(
                      "rounded-[1.15rem] border px-4 py-3 font-medium transition",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "border-slate-900 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tools</p>
            <div className="grid gap-3">
              {toolNavGroups.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 transition hover:border-sky-200 hover:bg-white" href={item.href}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Use cases</p>
            <div className="grid gap-3">
              {solutionNavGroups.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 transition hover:border-violet-200 hover:bg-white" href={item.href}>
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SheetClose asChild>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild className="w-full">
                <Link href="/tools">Get Started</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}