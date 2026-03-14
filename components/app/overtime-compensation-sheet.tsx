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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { overtimeWorkerCompensationSchema, type OvertimeWorkerCompensationValues } from "@/lib/validation/overtime";

const feedbackClasses = {
  success: "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700",
  error: "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700",
} as const;

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

          <form className="space-y-6" onSubmit={onSubmit}>
            <input type="hidden" value={workerUserId} {...register("workerUserId")} />
            <FormField label="Basic monthly salary" htmlFor={`salary-${workerUserId}`} hint="Use the employee basic salary only, not allowances or full gross pay." error={errors.basicMonthlySalary?.message}>
              <Input id={`salary-${workerUserId}`} type="number" step="0.01" min="0" placeholder="e.g. 2800" {...register("basicMonthlySalary")} />
            </FormField>

            {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Saving salary" : "Save salary"}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}