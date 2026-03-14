"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/app")) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}