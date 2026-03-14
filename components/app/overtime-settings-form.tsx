"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  addOvertimeHolidayAction,
  deleteOvertimeHolidayAction,
  saveOvertimeSettingsAction,
} from "@/app/app/overtime/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatOvertimeDate,
  overtimeCalculationModes,
  weekendDayOptions,
} from "@/lib/overtime";
import {
  overtimeHolidaySchema,
  overtimeSettingsSchema,
  type OvertimeHolidayValues,
  type OvertimeSettingsValues,
} from "@/lib/validation/overtime";

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";
const feedbackClasses = {
  success: "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700",
  error: "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700",
} as const;

export function OvertimeSettingsForm({
  scope,
  initialValues,
  holidays,
  canManageHolidays,
}: {
  scope: "individual" | "team";
  initialValues: OvertimeSettingsValues;
  holidays: Array<{ id: string; date: string; label: string | null }>;
  canManageHolidays: boolean;
}) {
  const router = useRouter();
  const [settingsMessage, setSettingsMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [holidayMessage, setHolidayMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isSavingSettings, startSavingSettings] = useTransition();
  const [isSavingHoliday, startSavingHoliday] = useTransition();
  const [isDeletingHolidayId, setIsDeletingHolidayId] = useState<string | null>(null);

  const settingsForm = useForm<OvertimeSettingsValues>({
    resolver: zodResolver(overtimeSettingsSchema),
    defaultValues: initialValues,
  });
  const holidayForm = useForm<OvertimeHolidayValues>({
    resolver: zodResolver(overtimeHolidaySchema),
    defaultValues: {
      holidayDate: "",
      label: "",
    },
  });

  const calculationMode = settingsForm.watch("calculationMode");
  const ramadanEnabled = settingsForm.watch("ramadanEnabled");

  useEffect(() => {
    settingsForm.reset(initialValues);
  }, [initialValues, settingsForm]);

  const onSubmitSettings = settingsForm.handleSubmit((values) => {
    setSettingsMessage(null);
    startSavingSettings(async () => {
      const result = await saveOvertimeSettingsAction(values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              settingsForm.setError(field as keyof OvertimeSettingsValues, { message: error });
            }
          });
        }
        setSettingsMessage({ tone: "error", text: result.message });
        return;
      }

      setSettingsMessage({ tone: "success", text: result.message });
      router.refresh();
    });
  });

  const onSubmitHoliday = holidayForm.handleSubmit((values) => {
    setHolidayMessage(null);
    startSavingHoliday(async () => {
      const result = await addOvertimeHolidayAction(values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              holidayForm.setError(field as keyof OvertimeHolidayValues, { message: error });
            }
          });
        }
        setHolidayMessage({ tone: "error", text: result.message });
        return;
      }

      holidayForm.reset({ holidayDate: "", label: "" });
      setHolidayMessage({ tone: "success", text: result.message });
      router.refresh();
    });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-[1.7rem] border border-white/85 bg-white/88 shadow-card backdrop-blur-md">
        <div className="border-b border-slate-100 p-7">
          <div className="flex items-start gap-4">
            <IconTile icon={Settings2} tone="purple" size="lg" />
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950">Overtime settings</h3>
              <p className="text-sm leading-6 text-slate-600">Keep the calculation rules obvious for small teams and individual operators. These settings are used by the shift entry preview and by the saved records themselves.</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-7">
          <form className="space-y-6" onSubmit={onSubmitSettings}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Calculation mode" htmlFor="settings-mode" error={settingsForm.formState.errors.calculationMode?.message}>
                <select id="settings-mode" className={selectClasses} {...settingsForm.register("calculationMode")}>
                  {overtimeCalculationModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Standard daily hours" htmlFor="settings-standard-hours" error={settingsForm.formState.errors.standardDailyHours?.message}>
                <Input id="settings-standard-hours" type="number" step="0.5" min="1" max="24" {...settingsForm.register("standardDailyHours")} />
              </FormField>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Simple mode hourly rate"
                htmlFor="settings-fixed-rate"
                hint={calculationMode === "simple" ? "Required for Simple Mode." : "Only used when the mode is Simple."}
                error={settingsForm.formState.errors.fixedHourlyRate?.message}
              >
                <Input id="settings-fixed-rate" type="number" step="0.01" min="0" {...settingsForm.register("fixedHourlyRate")} />
              </FormField>
              {scope === "individual" ? (
                <FormField
                  label="Your basic monthly salary"
                  htmlFor="settings-salary"
                  hint="Needed only for individual MOHRE-compliant calculations."
                  error={settingsForm.formState.errors.individualBasicMonthlySalary?.message}
                >
                  <Input id="settings-salary" type="number" step="0.01" min="0" {...settingsForm.register("individualBasicMonthlySalary")} />
                </FormField>
              ) : (
                <div className="space-y-3 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Worker salaries</p>
                  <p className="text-sm leading-6 text-slate-600">For team mode, worker basic salaries are managed in the Members tab so each person can have a different compensation profile.</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Weekend days</p>
              <p className="text-xs leading-5 text-slate-500">These days are treated as rest days for compliant overtime calculations.</p>
              <div className="grid gap-3 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {weekendDayOptions.map((day) => (
                  <label key={day.value} className="flex items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-white/90 px-3 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white">
                    <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" {...settingsForm.register("weekendDays")} />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
              {settingsForm.formState.errors.weekendDays?.message ? <div className={feedbackClasses.error}>{settingsForm.formState.errors.weekendDays.message}</div> : null}
            </div>

            <div className="space-y-4 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" {...settingsForm.register("ramadanEnabled")} />
                Enable Ramadan hour reduction
              </label>
              <p className="text-xs leading-5 text-slate-500">When active, compliant mode will reduce standard daily hours to 6 during the date range below.</p>
              {ramadanEnabled ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Ramadan start date" htmlFor="settings-ramadan-start" error={settingsForm.formState.errors.ramadanStartDate?.message}>
                    <Input id="settings-ramadan-start" type="date" {...settingsForm.register("ramadanStartDate")} />
                  </FormField>
                  <FormField label="Ramadan end date" htmlFor="settings-ramadan-end" error={settingsForm.formState.errors.ramadanEndDate?.message}>
                    <Input id="settings-ramadan-end" type="date" {...settingsForm.register("ramadanEndDate")} />
                  </FormField>
                </div>
              ) : null}
            </div>

            {settingsMessage ? <div className={feedbackClasses[settingsMessage.tone]}>{settingsMessage.text}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" size="lg" disabled={isSavingSettings}>
                {isSavingSettings ? "Saving settings" : "Save settings"}
              </Button>
              <Badge variant={scope === "team" ? "purple" : "blue"}>{scope === "team" ? "Team policy" : "Individual policy"}</Badge>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[1.7rem] border border-white/85 bg-white/88 shadow-card backdrop-blur-md">
          <div className="border-b border-slate-100 p-7">
            <div className="flex items-start gap-4">
              <IconTile icon={CalendarDays} tone="amber" size="lg" />
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950">Holiday dates</h3>
                <p className="text-sm leading-6 text-slate-600">Public holiday dates can be flagged manually for the MVP so the system treats work on those days as rest day overtime.</p>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-7">
            {canManageHolidays ? (
              <form className="space-y-5" onSubmit={onSubmitHoliday}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Holiday date" htmlFor="holiday-date" error={holidayForm.formState.errors.holidayDate?.message}>
                    <Input id="holiday-date" type="date" {...holidayForm.register("holidayDate")} />
                  </FormField>
                  <FormField label="Label" htmlFor="holiday-label" hint="Optional, for example Eid Holiday or National Day." error={holidayForm.formState.errors.label?.message}>
                    <Input id="holiday-label" type="text" placeholder="Eid Holiday" {...holidayForm.register("label")} />
                  </FormField>
                </div>
                {holidayMessage ? <div className={feedbackClasses[holidayMessage.tone]}>{holidayMessage.text}</div> : null}
                <Button type="submit" variant="secondary" disabled={isSavingHoliday}>
                  {isSavingHoliday ? "Saving holiday" : "Add holiday date"}
                </Button>
              </form>
            ) : (
              <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
                Individual workspaces do not need a separate holiday list. Team admins can manage holiday dates here when a shared overtime workspace is active.
              </div>
            )}

            <div className="space-y-3">
              {holidays.length ? holidays.map((holiday) => (
                <div key={holiday.id} className="flex flex-col gap-3 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{formatOvertimeDate(holiday.date)}</p>
                    <p className="mt-1 text-sm text-slate-500">{holiday.label || "Public holiday flag"}</p>
                  </div>
                  {canManageHolidays ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeletingHolidayId === holiday.id}
                      onClick={() => {
                        setHolidayMessage(null);
                        setIsDeletingHolidayId(holiday.id);
                        startSavingHoliday(async () => {
                          const result = await deleteOvertimeHolidayAction(holiday.id);
                          setIsDeletingHolidayId(null);
                          setHolidayMessage({
                            tone: result.status === "success" ? "success" : "error",
                            text: result.message,
                          });
                          router.refresh();
                        });
                      }}
                    >
                      {isDeletingHolidayId === holiday.id ? "Removing" : "Remove"}
                    </Button>
                  ) : null}
                </div>
              )) : (
                <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm leading-6 text-slate-600">
                  No holiday dates have been added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}