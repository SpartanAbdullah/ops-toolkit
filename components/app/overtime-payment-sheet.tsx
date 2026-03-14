"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { markOvertimePaymentAction } from "@/app/app/overtime/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getTodayInputValue } from "@/lib/overtime";
import { overtimePaymentSchema, type OvertimePaymentValues } from "@/lib/validation/overtime";

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";
const feedbackClasses = {
  success: "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700",
  error: "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700",
} as const;

type WorkerOption = {
  id: string;
  name: string;
};

export function OvertimePaymentSheet({
  workers,
  buttonLabel,
  buttonVariant = "secondary",
  buttonSize = "default",
}: {
  workers: WorkerOption[];
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const firstWorkerId = workers[0]?.id ?? "";
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<OvertimePaymentValues>({
    resolver: zodResolver(overtimePaymentSchema),
    defaultValues: {
      workerUserId: firstWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      workerUserId: firstWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    });
    setMessage(null);
  }, [firstWorkerId, open, reset]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await markOvertimePaymentAction(values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              setError(field as keyof OvertimePaymentValues, { message: error });
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
        <Button variant={buttonVariant} size={buttonSize} disabled={!workers.length}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="max-w-[96vw] overflow-y-auto p-0 sm:max-w-lg">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-6 py-6 backdrop-blur">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconTile icon={CircleDollarSign} tone="green" size="lg" />
              <div className="space-y-2">
                <SheetTitle>Mark overtime paid</SheetTitle>
                <SheetDescription>Record the latest paid-until date so workers can see whether their approved overtime is up to date.</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        <div className="space-y-6 px-6 py-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField label="Worker" htmlFor="payment-worker" error={errors.workerUserId?.message}>
              <select id="payment-worker" className={selectClasses} {...register("workerUserId")}>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Paid until date" htmlFor="paid-until-date" hint="Approved overtime on or before this date will show as paid." error={errors.paidUntilDate?.message}>
              <Input id="paid-until-date" type="date" {...register("paidUntilDate")} />
            </FormField>

            <FormField label="Note" htmlFor="payment-note" hint="Optional reference such as payroll batch, WPS cycle, or cash handover." error={errors.note?.message}>
              <Textarea id="payment-note" className="min-h-[110px]" placeholder="Optional payroll note or reference." {...register("note")} />
            </FormField>

            {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" size="lg" disabled={isPending || !workers.length}>
                {isPending ? "Saving payment" : "Save payment status"}
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