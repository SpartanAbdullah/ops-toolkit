"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, MoonStar, Plus, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { createOvertimeEntryAction } from "@/app/app/overtime/actions";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import {
  calculateOvertime,
  formatMinutesAsHours,
  getTodayInputValue,
  type OvertimeSettingsSnapshot,
} from "@/lib/overtime";
import { overtimeEntrySchema, type OvertimeEntryValues } from "@/lib/validation/overtime";

function buildDefaultValues(): OvertimeEntryValues {
  return {
    workedDate: getTodayInputValue(),
    startTime: "",
    endTime: "",
    overnight: false,
    notes: "",
  };
}

export function OvertimeEntrySheet({
  buttonLabel,
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName,
  buttonIcon = false,
  settings,
  holidayDates,
  workerSalary,
  approvalLabel,
}: {
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  buttonClassName?: string;
  buttonIcon?: boolean;
  settings: OvertimeSettingsSnapshot;
  holidayDates: string[];
  workerSalary: number | null;
  approvalLabel: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<OvertimeEntryValues>({
    resolver: zodResolver(overtimeEntrySchema),
    defaultValues: buildDefaultValues(),
  });

  // Open the sheet automatically when the URL says ?action=log
  useEffect(() => {
    if (searchParams.get("action") === "log") {
      setOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`/app/overtime${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    }
  }, [searchParams, router]);

  const workedDate = watch("workedDate");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const overnight = watch("overnight");

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(buildDefaultValues());
    setMessage(null);
  }, [open, reset]);

  const preview = calculateOvertime({
    workedDate,
    startTime,
    endTime,
    overnight,
    calculationMode: settings.calculationMode,
    standardDailyHours: settings.standardDailyHours,
    simpleHourlyRate: settings.simpleHourlyRate,
    basicMonthlySalary: settings.calculationMode === "mohre_compliant" ? workerSalary : null,
    weekendDays: settings.weekendDays,
    holidayDates,
    ramadanEnabled: settings.ramadanEnabled,
    ramadanStartDate: settings.ramadanStartDate,
    ramadanEndDate: settings.ramadanEndDate,
  });

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await createOvertimeEntryAction(values);
      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              setError(field as keyof OvertimeEntryValues, { message: error });
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
        <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
          {buttonIcon ? <Plus className="h-4 w-4" /> : null}
          {buttonLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <div className="flex h-full max-h-[94vh] flex-col overflow-y-auto">
          <div className="space-y-1 border-b border-border px-5 pb-4 pt-6 sm:px-6">
            <SheetHeader>
              <div className="flex items-start gap-3">
                <IconTile icon={Clock3} tone="amber" size="md" />
                <div className="space-y-1">
                  <SheetTitle>Log overtime shift</SheetTitle>
                  <SheetDescription>{approvalLabel}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="flex items-center gap-2 pt-3">
              <Badge variant={settings.calculationMode === "simple" ? "navy" : "amber"}>
                {settings.calculationMode === "simple" ? "Simple Mode" : "MOHRE-Compliant"}
              </Badge>
              <Badge variant="subtle">{preview.standardDailyHoursApplied.toFixed(1)} hr standard{preview.ramadanApplied ? " (Ramadan)" : ""}</Badge>
            </div>
          </div>

          <form className="flex flex-1 flex-col space-y-5 px-5 py-5 sm:px-6" onSubmit={onSubmit}>
            <FormField label="Shift date" htmlFor="overtime-date" error={errors.workedDate?.message}>
              <Input id="overtime-date" type="date" {...register("workedDate")} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Start time" htmlFor="overtime-start" error={errors.startTime?.message}>
                <Input id="overtime-start" type="time" {...register("startTime")} />
              </FormField>
              <FormField label="End time" htmlFor="overtime-end" error={errors.endTime?.message}>
                <Input id="overtime-end" type="time" {...register("endTime")} />
              </FormField>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-accent-600 focus:ring-accent-500" {...register("overnight")} />
              <span>
                <span className="block font-semibold text-text-primary">Ended after midnight</span>
                <span className="block text-2xs leading-4 text-text-muted">Use this when the end time is on the next day.</span>
              </span>
            </label>

            <FormField label="Notes" htmlFor="overtime-notes" optional error={errors.notes?.message}>
              <Textarea id="overtime-notes" className="min-h-[88px]" placeholder="Context for the approver — site, urgent task, etc." {...register("notes")} />
            </FormField>

            {/* Live preview */}
            <div className="rounded-2xl border border-border bg-surface-muted p-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xs uppercase tracking-wide text-text-muted">Worked</p>
                  <p className="mt-1 font-display text-base font-semibold text-text-primary">{formatMinutesAsHours(preview.totalWorkedMinutes)}</p>
                </div>
                <div>
                  <p className="text-2xs uppercase tracking-wide text-text-muted">OT</p>
                  <p className="mt-1 font-display text-base font-semibold text-accent-foreground">{formatMinutesAsHours(preview.overtimeMinutes)}</p>
                </div>
                <div>
                  <p className="text-2xs uppercase tracking-wide text-text-muted">AED</p>
                  <p className="mt-1 font-display text-base font-semibold text-mint-600">{formatCurrency(preview.amount)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 border-t border-border pt-3">
                <ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${preview.error ? "text-danger-600" : "text-primary-600"}`} />
                <div className="space-y-1 text-sm leading-5 text-text-secondary">
                  <p>{preview.error || preview.calculationSummary || "Enter shift times to preview overtime."}</p>
                  {preview.rateDescription ? <p className="text-2xs text-text-muted">{preview.rateDescription}</p> : null}
                </div>
              </div>
              {preview.nightOvertimeMinutes > 0 ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-2xs font-medium text-primary-700">
                  <MoonStar className="h-3.5 w-3.5" />
                  {formatMinutesAsHours(preview.nightOvertimeMinutes)} in the night window (10 PM–4 AM)
                </div>
              ) : null}
              {preview.wellbeingWarning ? (
                <p className="mt-2 rounded-lg bg-accent-50 px-3 py-2 text-2xs leading-4 text-accent-foreground">{preview.wellbeingWarning}</p>
              ) : null}
            </div>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2]" disabled={isPending || Boolean(preview.error)}>
                  {isPending ? "Saving..." : "Save shift"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
