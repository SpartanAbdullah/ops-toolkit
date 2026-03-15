import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  tone?: IconTone;
  accent?: React.ReactNode;
  className?: string;
};

export function StatCard({ label, value, description, icon, tone = "blue", accent, className }: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <div className="text-2xl font-semibold tracking-tight text-text-primary">{value}</div>
          </div>
          <IconTile icon={icon} tone={tone} size="sm" />
        </div>
        {description ? <p className="text-sm leading-6 text-text-secondary">{description}</p> : null}
        {accent ? <div>{accent}</div> : null}
      </CardContent>
    </Card>
  );
}
