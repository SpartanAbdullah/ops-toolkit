import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import type { IconTone } from "@/lib/types";

const toneSurfaces: Record<IconTone, string> = {
  blue: "border-primary-100 bg-primary-50",
  green: "border-success-50 bg-success-50",
  purple: "border-primary-100 bg-primary-50",
  amber: "border-warning-50 bg-warning-50",
  red: "border-danger-50 bg-danger-50",
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
            {description ? <p className="text-sm leading-6 text-text-secondary">{description}</p> : null}
          </div>
        </div>
      </CardHeader>
      {children ? <CardContent className="space-y-3 text-sm leading-6 text-text-secondary">{children}</CardContent> : null}
    </Card>
  );
}
