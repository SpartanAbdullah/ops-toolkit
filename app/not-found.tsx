import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <Compass className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">Page not found</h1>
          <p className="text-sm leading-6 text-text-secondary">
            That route does not exist. Head back to your workspace.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/app">Go to workspace</Link>
        </Button>
      </div>
    </div>
  );
}
