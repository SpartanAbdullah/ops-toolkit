"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { markOvertimePaymentAction } from "@/app/app/overtime/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { getTodayInputValue } from "@/lib/overtime";
import { cn } from "@/lib/utils";
import { overtimePaymentSchema, type OvertimePaymentValues } from "@/lib/validation/overtime";

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
  const [workerQuery, setWorkerQuery] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const firstWorkerId = workers[0]?.id ?? "";
  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<OvertimePaymentValues>({
    resolver: zodResolver(overtimePaymentSchema),
    defaultValues: {
      workerUserId: firstWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    },
  });
  const selectedWorkerId = watch("workerUserId");
  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId) ?? null;
  const filteredWorkers = useMemo(() => {
    const normalizedQuery = workerQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return workers;
    }

    return workers.filter((worker) => worker.name.toLowerCase().includes(normalizedQuery));
  }, [workerQuery, workers]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      workerUserId: firstWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    });
    setWorkerQuery("");
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
          <form className="space-y-6 pb-2" onSubmit={onSubmit}>
            <input type="hidden" {...register("workerUserId")} />
            <FormField label="Worker" htmlFor="payment-worker" error={errors.workerUserId?.message}>
              <div className="space-y-3">
                <SearchField
                  id="payment-worker"
                  value={workerQuery}
                  onChange={(event) => setWorkerQuery(event.target.value)}
                  placeholder="Search worker by name"
                  autoComplete="off"
                />
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-[1.3rem] border border-border bg-slate-50 p-2">
                  {filteredWorkers.length ? (
                    filteredWorkers.map((worker) => (
                      <button
                        key={worker.id}
                        type="button"
                        className={cn(
                          "w-full rounded-[1.1rem] border px-4 py-3 text-left text-sm font-medium transition",
                          selectedWorkerId === worker.id
                            ? "border-primary-600 bg-primary-50 text-primary-700"
                            : "border-transparent bg-white text-text-primary hover:border-primary-100 hover:bg-primary-50/60",
                        )}
                        onClick={() => {
                          setValue("workerUserId", worker.id, { shouldValidate: true, shouldDirty: true });
                          setMessage(null);
                        }}
                      >
                        {worker.name}
                      </button>
                    ))
                  ) : (
                    <EmptyState
                      title="No workers match this search"
                      description="Try a shorter name or clear the search field."
                      className="min-h-[180px] border-0 bg-transparent px-3 py-6 shadow-none"
                    />
                  )}
                </div>
                {selectedWorker ? (
                  <p className="text-sm text-text-secondary">Saving payment status for <span className="font-semibold text-text-primary">{selectedWorker.name}</span>.</p>
                ) : null}
              </div>
            </FormField>

            <FormField label="Paid until date" htmlFor="paid-until-date" hint="Approved overtime on or before this date will show as paid." error={errors.paidUntilDate?.message}>
              <Input id="paid-until-date" type="date" {...register("paidUntilDate")} />
            </FormField>

            <FormField label="Note" htmlFor="payment-note" hint="Optional reference such as payroll batch, WPS cycle, or cash handover." error={errors.note?.message}>
              <Textarea id="payment-note" className="min-h-[110px]" placeholder="Optional payroll note or reference." {...register("note")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">Use the latest paid-through date so workers and admins see the same payment checkpoint.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button type="submit" size="lg" disabled={isPending || !workers.length}>
                    {isPending ? "Saving payment" : "Save payment status"}
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
