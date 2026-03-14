import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";

export default function NotFound() {
  return (
    <div className="pb-20 pt-12 md:pt-16">
      <div className="container max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center md:px-10 md:py-16">
            <IconTile icon={Compass} tone="blue" size="lg" />
            <div className="space-y-3">
              <p className="hero-chip">Page not found</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">The page you tried to open is not available.</h1>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Try the tools directory, return to the homepage, or contact us if you were expecting a live tool or workspace route here.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/tools">
                  Browse tools
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">
                  Back to homepage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}