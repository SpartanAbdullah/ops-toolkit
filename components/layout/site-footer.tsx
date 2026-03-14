import Link from "next/link";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { companyFacts, featuredTools, solutions } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const footerGroups = [
  {
    title: "Popular tools",
    links: featuredTools.slice(0, 3).map((tool) => ({ label: tool.name, href: `/tools/${tool.slug}` })),
  },
  {
    title: "Use cases",
    links: solutions.slice(0, 4).map((solution) => ({ label: solution.label, href: `/solutions/${solution.slug}` })),
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Login", href: "/login" },
      { label: "Get Started", href: "/signup" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Tools Directory", href: "/tools" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/70 bg-white/80 py-16 backdrop-blur-sm">
      <div className="container">
        <div className="rounded-[2rem] border border-white/85 bg-hero-mesh p-6 shadow-soft md:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_auto] xl:items-center">
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-sky-200/90 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 text-sky-700 shadow-sm">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold tracking-tight text-slate-950">Ops Toolkit</div>
                  <div className="text-xs text-slate-500">Focused operations utilities</div>
                </div>
              </Link>
              <div className="max-w-2xl space-y-3">
                <p className="font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-[2.35rem]">
                  Cleaner operational workflows without a bloated system rollout.
                </p>
                <p className="text-sm leading-7 text-slate-600 md:text-base">
                  Use free public tools now, then move into the protected workspace for saved petty cash, overtime, exports, and team workflows when the process needs real structure.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {companyFacts.map((fact) => (
                  <div key={fact.label} className="rounded-[1.25rem] border border-white/90 bg-white/88 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{fact.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Button asChild size="lg">
                <Link href="/tools">Explore tools</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm space-y-5">
            <p className="text-sm leading-7 text-slate-600">
              Ops Toolkit helps teams stop running operations through scattered spreadsheets, chat messages, memory, and manual calculations.
            </p>
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Need a product or rollout question answered?</p>
              <p className="mt-2">Email <a className="font-semibold text-slate-900 underline-offset-4 hover:underline" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.</p>
            </div>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-lg font-semibold text-slate-950">{group.title}</h3>
              <div className="mt-4 grid gap-3">
                {group.links.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm leading-6 text-slate-600 transition hover:text-slate-950">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} Ops Toolkit. Focused operations tools and lightweight workflows for modern small teams.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-slate-900">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}