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
import { useToast } from "@/components/ui/toaster";
import { formatOvertimeDate, getTodayInputValue } from "@/lib/overtime";
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
  preselectedWorkerId,
}: {
  workers: WorkerOption[];
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  preselectedWorkerId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [workerQuery, setWorkerQuery] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const defaultWorkerId = preselectedWorkerId ?? workers[0]?.id ?? "";
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
      workerUserId: defaultWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    },
  });
  const selectedWorkerId = watch("workerUserId");
  const selectedWorker = workers.find((worker) => worker.id === selectedWorkerId) ?? null;
  const filteredWorkers = useMemo(() => {
    const normalizedQuery = workerQuery.trim().toLowerCase();
    if (!normalizedQuery) return workers;
    return workers.filter((worker) => worker.name.toLowerCase().includes(normalizedQuery));
  }, [workerQuery, workers]);

  useEffect(() => {
    if (!open) return;
    reset({
      workerUserId: defaultWorkerId,
      paidUntilDate: getTodayInputValue(),
      note: "",
    });
    setWorkerQuery("");
    setMessage(null);
  }, [defaultWorkerId, open, reset]);

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    const workerName = workers.find((w) => w.id === values.workerUserId)?.name ?? "Worker";
    if (!window.confirm(`Mark approved overtime paid for ${workerName} through ${formatOvertimeDate(values.paidUntilDate)}?`)) {
      return;
    }
    startTransition(async () => {
      const result = await markOvertimePaymentAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) setError(field as keyof OvertimePaymentValues, { message: error });
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }
      toast({
        title: "Payment recorded",
        description: `${workerName} · paid through ${formatOvertimeDate(values.paidUntilDate)}`,
        tone: "success",
      });
      setOpen(false);
      router.refresh();
    });
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} disabled={!workers.length}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={CircleDollarSign} tone="mint" size="md" />
                <div className="space-y-1">
                  <SheetTitle>Mark overtime paid</SheetTitle>
                  <SheetDescription>Approved OT on or before this date will show as paid.</SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <form className="flex flex-1 flex-col space-y-5 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            <input type="hidden" {...register("workerUserId")} />
            <FormField label="Worker" htmlFor="payment-worker" error={errors.workerUserId?.message}>
              <div className="space-y-3">
                <SearchField
                  id="payment-worker"
                  value={workerQuery}
                  onChange={(event) => setWorkerQuery(event.target.value)}
                  placeholder="Search workers"
                  autoComplete="off"
                />
                <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-surface-muted p-1.5">
                  {filteredWorkers.length ? (
                    filteredWorkers.map((worker) => (
                      <button
                        key={worker.id}
                        type="button"
                        className={cn(
                          "tap-highlight w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition",
                          selectedWorkerId === worker.id
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-white text-text-primary hover:bg-primary-50",
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
                      title="No matches"
                      description="Try a shorter name or clear the search."
                      className="min-h-[120px] border-0 bg-transparent px-3 py-4"
                    />
                  )}
                </div>
              </div>
            </FormField>

            <FormField label="Paid until" htmlFor="paid-until-date" error={errors.paidUntilDate?.message}>
              <Input id="paid-until-date" type="date" {...register("paidUntilDate")} />
            </FormField>

            <FormField label="Note" htmlFor="payment-note" optional hint="Payroll batch, WPS cycle, etc." error={errors.note?.message}>
              <Textarea id="payment-note" className="min-h-[80px]" placeholder="Optional reference" {...register("note")} />
            </FormField>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2]" disabled={isPending || !selectedWorker}>
                  {isPending ? "Saving..." : "Save payment"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
