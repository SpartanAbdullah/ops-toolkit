"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmationDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  confirmVariant?: ButtonProps["variant"];
};

export function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  trigger,
  confirmVariant = "danger",
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-white p-6 shadow-soft",
          )}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition hover:bg-slate-100 hover:text-text-primary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="flex items-start gap-4 pr-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-50 text-warning-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <DialogPrimitive.Title className="text-lg font-semibold text-text-primary">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-6 text-text-secondary">{description}</DialogPrimitive.Description>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              onClick={async () => {
                await onConfirm();
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
