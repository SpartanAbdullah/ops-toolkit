import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const toneMap = {
  info: {
    icon: Info,
    className: "border-primary-100 bg-primary-50 text-primary-700",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success-50 bg-success-50 text-success-600",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-warning-50 bg-warning-50 text-amber-800",
  },
  error: {
    icon: AlertCircle,
    className: "border-danger-50 bg-danger-50 text-danger-600",
  },
} as const;

type InlineMessageProps = {
  tone?: keyof typeof toneMap;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function InlineMessage({ tone = "info", title, children, className }: InlineMessageProps) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6", config.className, className)} role={tone === "error" ? "alert" : "status"}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
