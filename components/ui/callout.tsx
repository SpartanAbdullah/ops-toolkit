import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneSurfaces: Record<IconTone, string> = {
  blue: "border-sky-100 bg-sky-50/60",
  green: "border-emerald-100 bg-emerald-50/60",
  purple: "border-violet-100 bg-violet-50/60",
  amber: "border-amber-100 bg-amber-50/70",
  red: "border-rose-100 bg-rose-50/70",
};

type CalloutProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: IconTone;
  children?: React.ReactNode;
  className?: string;
};

export function Callout({ title, description, icon, tone = "blue", children, className }: CalloutProps) {
  return (
    <Card className={cn(toneSurfaces[tone], className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <IconTile icon={icon} tone={tone} />
          <div className="space-y-1.5">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
        </div>
      </CardHeader>
      {children ? <CardContent className="space-y-3 text-sm leading-6 text-slate-600">{children}</CardContent> : null}
    </Card>
  );
}