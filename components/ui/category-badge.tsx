import { Badge } from "@/components/ui/badge";
import type { ToolCategory } from "@/lib/types";

const categoryVariantMap: Record<ToolCategory, Parameters<typeof Badge>[0]["variant"]> = {
  "Warehouse tools": "purple",
  "HR & payroll tools": "blue",
  "Admin & finance tools": "green",
  "Logistics tools": "amber",
  Utilities: "subtle",
};

type CategoryBadgeProps = {
  category: ToolCategory;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return <Badge variant={categoryVariantMap[category]}>{category}</Badge>;
}


