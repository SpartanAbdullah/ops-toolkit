"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  addOvertimeHolidayAction,
  deleteOvertimeHolidayAction,
  saveOvertimeSettingsAction,
} from "@/app/app/overtime/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
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
    defaultValues: { holidayDate: "", label: "" },
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
            if (error) settingsForm.setError(field as keyof OvertimeSettingsValues, { message: error });
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
            if (error) holidayForm.setError(field as keyof OvertimeHolidayValues, { message: error });
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
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-5">
          <SectionHeader
            eyebrow="Policy"
            title="Overtime settings"
            description="The calculation rules used for every new shift."
            badge={scope === "team" ? "Team policy" : "Individual"}
          />

          <form className="space-y-5" onSubmit={onSubmitSettings}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Calculation mode" htmlFor="settings-mode" error={settingsForm.formState.errors.calculationMode?.message}>
                <Select id="settings-mode" {...settingsForm.register("calculationMode")}>
                  {overtimeCalculationModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Standard daily hours" htmlFor="settings-standard-hours" error={settingsForm.formState.errors.standardDailyHours?.message}>
                <Input id="settings-standard-hours" type="number" step="0.5" min="1" max="24" inputMode="decimal" {...settingsForm.register("standardDailyHours")} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Simple mode hourly rate (AED)"
                htmlFor="settings-fixed-rate"
                hint={calculationMode === "simple" ? "Required for Simple Mode." : "Only used when mode is Simple."}
                error={settingsForm.formState.errors.fixedHourlyRate?.message}
              >
                <Input id="settings-fixed-rate" type="number" step="0.01" min="0" inputMode="decimal" {...settingsForm.register("fixedHourlyRate")} />
              </FormField>
              {scope === "individual" ? (
                <FormField
                  label="Your basic monthly salary (AED)"
                  htmlFor="settings-salary"
                  hint="For individual compliant calculations."
                  error={settingsForm.formState.errors.individualBasicMonthlySalary?.message}
                >
                  <Input id="settings-salary" type="number" step="0.01" min="0" inputMode="decimal" {...settingsForm.register("individualBasicMonthlySalary")} />
                </FormField>
              ) : (
                <div className="rounded-xl border border-border bg-surface-muted p-3.5 text-sm leading-5 text-text-secondary">
                  <p className="font-semibold text-text-primary">Worker salaries</p>
                  <p className="mt-1">In team mode, salaries are set in the Members tab.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-primary">Weekend days</p>
              <p className="text-2xs text-text-muted">These are treated as rest days for compliant overtime.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {weekendDayOptions.map((day) => (
                  <label key={day.value} className="tap-highlight flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-secondary transition has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700">
                    <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-50" {...settingsForm.register("weekendDays")} />
                    <span className="font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
              {settingsForm.formState.errors.weekendDays?.message ? <InlineMessage tone="error">{settingsForm.formState.errors.weekendDays.message}</InlineMessage> : null}
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-50" {...settingsForm.register("ramadanEnabled")} />
                Ramadan hour reduction
              </label>
              <p className="text-2xs text-text-muted">Reduces standard daily hours to 6 during the configured range.</p>
              {ramadanEnabled ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Start date" htmlFor="settings-ramadan-start" error={settingsForm.formState.errors.ramadanStartDate?.message}>
                    <Input id="settings-ramadan-start" type="date" {...settingsForm.register("ramadanStartDate")} />
                  </FormField>
                  <FormField label="End date" htmlFor="settings-ramadan-end" error={settingsForm.formState.errors.ramadanEndDate?.message}>
                    <Input id="settings-ramadan-end" type="date" {...settingsForm.register("ramadanEndDate")} />
                  </FormField>
                </div>
              ) : null}
            </div>

            {settingsMessage ? <InlineMessage tone={settingsMessage.tone}>{settingsMessage.text}</InlineMessage> : null}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Badge variant={scope === "team" ? "navy" : "subtle"}>{scope === "team" ? "Shared rules" : "Personal rules"}</Badge>
              <Button type="submit" disabled={isSavingSettings}>
                {isSavingSettings ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <SectionHeader
            eyebrow="Public holidays"
            title="Holiday schedule"
            description="Mark UAE public holidays here. Any shift logged on these dates is paid as full overtime — every worked hour at your OT rate, no standard-hours deduction."
          />

          {canManageHolidays ? (
            <form className="space-y-4" onSubmit={onSubmitHoliday}>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Holiday date" htmlFor="holiday-date" error={holidayForm.formState.errors.holidayDate?.message}>
                  <Input id="holiday-date" type="date" {...holidayForm.register("holidayDate")} />
                </FormField>
                <FormField label="Label" htmlFor="holiday-label" optional error={holidayForm.formState.errors.label?.message}>
                  <Input id="holiday-label" type="text" placeholder="e.g. Eid Al Fitr" {...holidayForm.register("label")} />
                </FormField>
              </div>
              {holidayMessage ? <InlineMessage tone={holidayMessage.tone}>{holidayMessage.text}</InlineMessage> : null}
              <Button type="submit" variant="secondary" size="sm" disabled={isSavingHoliday}>
                {isSavingHoliday ? "Saving..." : "Add holiday"}
              </Button>
            </form>
          ) : (
            <InlineMessage tone="info">Holiday dates apply to the team workflow.</InlineMessage>
          )}

          {holidays.length ? (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-border bg-white px-3.5 py-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-text-primary">{formatOvertimeDate(holiday.date)}</p>
                    <p className="text-2xs text-text-muted">{holiday.label || "Public holiday"}</p>
                  </div>
                  {canManageHolidays ? (
                    <ConfirmationDialog
                      title="Remove holiday?"
                      description="Work on this date will no longer be treated as a holiday."
                      confirmLabel={isDeletingHolidayId === holiday.id ? "Removing..." : "Remove"}
                      onConfirm={async () => {
                        setHolidayMessage(null);
                        setIsDeletingHolidayId(holiday.id);
                        startSavingHoliday(async () => {
                          const result = await deleteOvertimeHolidayAction(holiday.id);
                          setIsDeletingHolidayId(null);
                          setHolidayMessage({ tone: result.status === "success" ? "success" : "error", text: result.message });
                          router.refresh();
                        });
                      }}
                      trigger={<Button type="button" variant="ghost" size="sm" disabled={isDeletingHolidayId === holiday.id}>Remove</Button>}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No holiday dates"
              description="Add holidays your team needs for OT treatment."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
