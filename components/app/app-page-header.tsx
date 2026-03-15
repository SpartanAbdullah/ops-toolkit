import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

type PageHeaderAction = {
  href: string;
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
};

type AppPageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
  links?: PageHeaderAction[];
  className?: string;
};

export function AppPageHeader({ eyebrow, title, description, badge, actions, links = [], className }: AppPageHeaderProps) {
  return (
    <div className={cn("rounded-[28px] border border-border bg-white px-5 py-6 shadow-card sm:px-6 sm:py-7", className)}>
      <SectionHeader
        eyebrow={eyebrow}
        badge={badge}
        title={<span className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.9rem]">{title}</span>}
        description={description}
        actions={
          actions ?? (links.length ? (
            <>
              {links.map((link, index) => (
                <Button key={link.href} asChild variant={link.variant ?? (index === 0 ? "default" : "secondary")}>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </>
          ) : undefined)
        }
      />
    </div>
  );
}
