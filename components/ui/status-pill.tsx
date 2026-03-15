import { Badge, type BadgeProps } from "@/components/ui/badge";

type StatusPillProps = BadgeProps;

export function StatusPill(props: StatusPillProps) {
  return <Badge {...props} />;
}
