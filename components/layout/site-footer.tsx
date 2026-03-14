import Link from "next/link";
import { Boxes } from "lucide-react";

import { solutionNavGroups, toolNavGroups } from "@/lib/content";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Tools", href: "/tools" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Login", href: "/login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/70 bg-white/80 py-16 backdrop-blur-sm">
      <div className="container grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 shadow-sm">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight text-slate-950">Ops Toolkit</div>
              <div className="text-xs text-slate-500">Focused operations utilities</div>
            </div>
          </Link>
          <p className="text-sm leading-7 text-slate-600">
            Ops Toolkit helps teams stop running operations through scattered spreadsheets, chat messages, memory, and manual calculations.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">Tools</h3>
          <div className="mt-4 grid gap-3">
            {toolNavGroups.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm leading-6 text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">Use Cases</h3>
          <div className="mt-4 grid gap-3">
            {solutionNavGroups.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm leading-6 text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-950">Company</h3>
          <div className="mt-4 grid gap-3">
            {footerGroups.flatMap((group) => group.links).map((item) => (
              <Link key={item.href} href={item.href} className="text-sm leading-6 text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="container mt-12 border-t border-slate-100 pt-6 text-sm text-slate-500">
        © 2026 Ops Toolkit. Clear operational utilities for modern small teams.
      </div>
    </footer>
  );
}


