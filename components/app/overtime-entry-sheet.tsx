"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, MoonStar, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
  settings,
  holidayDates,
  workerSalary,
  approvalLabel,
}: {
  buttonLabel: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  settings: OvertimeSettingsSnapshot;
  holidayDates: string[];
  workerSalary: number | null;
  approvalLabel: string;
}) {
  const router = useRouter();
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
        <Button variant={buttonVariant} size={buttonSize}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent className="max-w-[96vw] overflow-y-auto p-0 sm:max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-6 py-6 backdrop-blur">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <IconTile icon={Clock3} tone="purple" size="lg" />
              <div className="space-y-2">
                <SheetTitle>Log overtime shift</SheetTitle>
                <SheetDescription>Capture a shift quickly, preview total worked time and AED, then send it into the approval flow with the current team settings.</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>
        <div className="space-y-8 px-6 py-6">
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/85 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Approval path</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{approvalLabel}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">The live preview below uses your current overtime mode, standard daily hours, weekend rules, and any configured Ramadan or holiday settings.</p>
              </div>
              <Badge variant={settings.calculationMode === "simple" ? "blue" : "purple"}>
                {settings.calculationMode === "simple" ? "Simple Mode" : "MOHRE-Compliant"}
              </Badge>
            </div>
          </div>

          <form className="space-y-6 pb-2" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Shift date" htmlFor="overtime-date" error={errors.workedDate?.message}>
                <Input id="overtime-date" type="date" {...register("workedDate")} />
              </FormField>
              <div className="space-y-3 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">Standard hours today</p>
                <p className="text-sm leading-6 text-slate-600">
                  {preview.standardDailyHoursApplied.toFixed(2)} hours {preview.ramadanApplied ? "after Ramadan adjustment" : "based on current settings"}.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Start time" htmlFor="overtime-start" error={errors.startTime?.message}>
                <Input id="overtime-start" type="time" {...register("startTime")} />
              </FormField>
              <FormField label="End time" htmlFor="overtime-end" error={errors.endTime?.message}>
                <Input id="overtime-end" type="time" {...register("endTime")} />
              </FormField>
            </div>

            <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white/90 px-4 py-4 text-sm text-slate-700 shadow-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" {...register("overnight")} />
              <span>
                This shift ended after midnight
                <span className="mt-1 block text-xs text-slate-500">Use this when the end time belongs to the next calendar day.</span>
              </span>
            </label>

            <FormField label="Notes" htmlFor="overtime-notes" hint="Optional context for the approver, such as site, urgent task, or public holiday work." error={errors.notes?.message}>
              <Textarea id="overtime-notes" className="min-h-[120px]" placeholder="Optional context for the shift or anything the approver should know." {...register("notes")} />
            </FormField>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[1.4rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total worked</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{formatMinutesAsHours(preview.totalWorkedMinutes)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Overtime</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{formatMinutesAsHours(preview.overtimeMinutes)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-950 p-4 text-white shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Estimated OT AED</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">AED {preview.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-5">
              <div className="flex items-start gap-3">
                <IconTile icon={ShieldCheck} tone={preview.error ? "red" : "blue"} size="sm" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Calculation preview</p>
                  <p className="text-sm leading-6 text-slate-600">{preview.error || preview.calculationSummary || "Enter the shift times to preview overtime."}</p>
                  <p className="text-sm text-slate-500">{preview.rateDescription || "Rate details will appear once the form is complete."}</p>
                </div>
              </div>
              {preview.nightOvertimeMinutes > 0 ? (
                <div className="rounded-[1.2rem] border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-violet-700">
                  {formatMinutesAsHours(preview.nightOvertimeMinutes)} falls into the 10 PM to 4 AM night period.
                </div>
              ) : null}
              {preview.wellbeingWarning ? (
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
                  <MoonStar className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{preview.wellbeingWarning}</p>
                </div>
              ) : null}
            </div>

            {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

            <StickyActionBar>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">Save once the preview looks right.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Saving shift" : "Save shift"}
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
