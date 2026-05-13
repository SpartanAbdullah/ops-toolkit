"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { saveOvertimeWorkerCompensationAction } from "@/app/app/overtime/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { formatCurrency } from "@/lib/utils";
import { overtimeWorkerCompensationSchema, type OvertimeWorkerCompensationValues } from "@/lib/validation/overtime";

export function OvertimeCompensationSheet({
  workerUserId,
  workerName,
  currentSalary,
  buttonLabel,
  buttonVariant = "secondary",
  buttonSize = "sm",
}: {
  workerUserId: string;
  workerName: string;
  currentSalary: number | null;
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<OvertimeWorkerCompensationValues>({
    resolver: zodResolver(overtimeWorkerCompensationSchema),
    defaultValues: {
      workerUserId,
      basicMonthlySalary: currentSalary ? currentSalary.toFixed(2) : "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      workerUserId,
      basicMonthlySalary: currentSalary ? currentSalary.toFixed(2) : "",
    });
    setMessage(null);
  }, [currentSalary, open, reset, workerUserId]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveOvertimeWorkerCompensationAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) setError(field as keyof OvertimeWorkerCompensationValues, { message: error });
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }
      setMessage({ tone: "success", text: result.message });
      setOpen(false);
      router.refresh();
    });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={Wallet} tone="mint" size="md" />
                <div className="space-y-1">
                  <SheetTitle>Worker salary</SheetTitle>
                  <SheetDescription>Used for MOHRE-compliant calculations.</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="mt-4 rounded-xl border border-border bg-surface-muted p-3.5">
              <p className="font-display text-sm font-semibold text-text-primary">{workerName}</p>
              <p className="mt-0.5 text-2xs text-text-muted">
                Current: {currentSalary ? formatCurrency(currentSalary) : "Not set yet"}
              </p>
            </div>
          </div>

          <form className="flex flex-1 flex-col space-y-5 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            <input type="hidden" value={workerUserId} {...register("workerUserId")} />
            <FormField
              label="Basic monthly salary (AED)"
              htmlFor={`salary-${workerUserId}`}
              hint="Basic salary only — no allowances."
              error={errors.basicMonthlySalary?.message}
            >
              <Input id={`salary-${workerUserId}`} type="number" step="0.01" min="0" placeholder="e.g. 2800" inputMode="decimal" {...register("basicMonthlySalary")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2]" disabled={isPending}>
                  {isPending ? "Saving..." : "Save salary"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
