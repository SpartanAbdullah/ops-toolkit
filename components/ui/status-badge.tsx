import { Badge } from "@/components/ui/badge";
import type { ToolStatus } from "@/lib/types";

const statusVariantMap: Record<ToolStatus, Parameters<typeof Badge>[0]["variant"]> = {
  Free: "blue",
  Pro: "purple",
  "Coming Soon": "amber",
};

type StatusBadgeProps = {
  status: ToolStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}


