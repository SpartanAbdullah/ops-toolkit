"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { markAllNotificationsReadAction } from "@/app/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

const TYPE_META = {
  info: { icon: Info, tone: "navy" as const },
  success: { icon: CheckCircle2, tone: "mint" as const },
  warning: { icon: TriangleAlert, tone: "amber" as const },
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-AE", { dateStyle: "medium" });
}

export function NotificationsSheet({
  unreadCount,
  notifications,
}: {
  unreadCount: number;
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="tap-highlight relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary-200 hover:text-primary-700"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-2xs font-semibold text-primary-700">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <div className="flex h-full max-h-[94vh] flex-col overflow-hidden">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={Bell} tone={unreadCount > 0 ? "amber" : "slate"} size="md" />
                <div className="space-y-1">
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>
                    {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await markAllNotificationsReadAction();
                    router.refresh();
                  })
                }
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {!notifications.length ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="Approvals, rejections, and payment updates will show here."
                className="min-h-[260px]"
              />
            ) : (
              <div className="space-y-2">
                {notifications.map((item) => {
                  const meta = TYPE_META[item.type] ?? TYPE_META.info;
                  const Icon = meta.icon;
                  const unread = item.readAt == null;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-3.5 transition",
                        unread
                          ? "border-accent-100 bg-accent-50/40"
                          : "border-border bg-white",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <IconTile icon={Icon} tone={meta.tone} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-display text-sm font-semibold text-text-primary">
                              {item.title}
                            </p>
                            {unread ? <Badge variant="amber">New</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm leading-5 text-text-secondary">{item.body}</p>
                          <p className="mt-1 text-2xs text-text-muted">{timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
