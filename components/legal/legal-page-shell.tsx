import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

type LegalAction = {
  label: string;
  href: string;
  variant?: ButtonProps["variant"];
};

type LegalPageShellProps = {
  title: string;
  description: string;
  lastUpdated: string;
  relatedLinks: LegalAction[];
  children: React.ReactNode;
};

export function LegalPageShell({
  title,
  description,
  lastUpdated,
  relatedLinks,
  children,
}: LegalPageShellProps) {
  return (
    <div className="pb-20 pt-8 md:pt-12">
      <div className="container">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            {relatedLinks.map((link) => (
              <Button key={link.href} asChild variant={link.variant ?? "ghost"} size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-label">Ops Toolkit</p>
                <Badge variant="subtle">Last updated {lastUpdated}</Badge>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[2.5rem]">
                  {title}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-text-secondary">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-8 p-6 sm:p-8">
              {children}
            </CardContent>
          </Card>

          <Card className="border-primary-100 bg-primary-50/70">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-text-primary">Questions about these terms?</p>
                <p className="text-sm leading-6 text-text-secondary">
                  Contact{" "}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="font-semibold text-text-primary underline-offset-4 hover:underline"
                  >
                    {siteConfig.supportEmail}
                  </a>
                  {" "}with the page name and your question so we can respond clearly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {relatedLinks.map((link) => (
                  <Button key={`${link.href}-footer`} asChild variant={link.variant ?? "secondary"}>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type LegalSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-3 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-base leading-8 text-text-secondary [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
