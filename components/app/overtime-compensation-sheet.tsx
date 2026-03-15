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
    if (!open) {
      return;
    }

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
            if (error) {
              setError(field as keyof OvertimeWorkerCompensationValues, { message: error });
            }
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
      <SheetContent className="max-w-[96vw] overflow-y-auto p-0 sm:max-w-lg">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-6 py-6 backdrop-blur">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconTile icon={Wallet} tone="green" size="lg" />
              <div className="space-y-2">
                <SheetTitle>Worker compensation profile</SheetTitle>
                <SheetDescription>Set the worker basic monthly salary used for MOHRE-compliant overtime calculations.</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-950">{workerName}</p>
            <p className="mt-1 text-sm text-slate-500">Current salary: {currentSalary ? `AED ${currentSalary.toFixed(2)}` : "Not set yet"}</p>
          </div>

          <form className="space-y-6 pb-2" onSubmit={onSubmit}>
            <input type="hidden" value={workerUserId} {...register("workerUserId")} />
            <FormField label="Basic monthly salary" htmlFor={`salary-${workerUserId}`} hint="Use the employee basic salary only, not allowances or full gross pay." error={errors.basicMonthlySalary?.message}>
              <Input id={`salary-${workerUserId}`} type="number" step="0.01" min="0" placeholder="e.g. 2800" {...register("basicMonthlySalary")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">Use the basic salary only so compliant calculations stay accurate.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Saving salary" : "Save salary"}
                  </Button>
                  <Button type="button" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
