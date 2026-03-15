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
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
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
      <Card>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <SectionHeader
            eyebrow="Policy"
            title="Overtime settings"
            description="Keep the policy obvious so supervisors and admins can move fast without second-guessing the calculation rules."
            badge={scope === "team" ? "Team policy" : "Individual policy"}
          />

          <form className="space-y-6" onSubmit={onSubmitSettings}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Calculation mode" htmlFor="settings-mode" error={settingsForm.formState.errors.calculationMode?.message}>
                <Select id="settings-mode" {...settingsForm.register("calculationMode")}>
                  {overtimeCalculationModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Standard daily hours" htmlFor="settings-standard-hours" error={settingsForm.formState.errors.standardDailyHours?.message}>
                <Input id="settings-standard-hours" type="number" step="0.5" min="1" max="24" {...settingsForm.register("standardDailyHours")} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  hint="Needed only for individual compliant calculations."
                  error={settingsForm.formState.errors.individualBasicMonthlySalary?.message}
                >
                  <Input id="settings-salary" type="number" step="0.01" min="0" {...settingsForm.register("individualBasicMonthlySalary")} />
                </FormField>
              ) : (
                <div className="rounded-3xl border border-border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-text-primary">Worker salaries</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">In team mode, worker salary profiles are managed from the Members tab.</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-primary">Weekend days</p>
              <p className="text-sm text-text-muted">These days are treated as rest days for compliant overtime calculations.</p>
              <div className="grid gap-3 rounded-3xl border border-border bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {weekendDayOptions.map((day) => (
                  <label key={day.value} className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-3 text-sm text-text-secondary transition hover:bg-primary-50">
                    <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-50" {...settingsForm.register("weekendDays")} />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
              {settingsForm.formState.errors.weekendDays?.message ? <InlineMessage tone="error">{settingsForm.formState.errors.weekendDays.message}</InlineMessage> : null}
            </div>

            <div className="space-y-4 rounded-3xl border border-border bg-slate-50 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-text-primary">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-50" {...settingsForm.register("ramadanEnabled")} />
                Enable Ramadan hour reduction
              </label>
              <p className="text-sm text-text-secondary">When active, compliant mode reduces standard daily hours to 6 during the configured Ramadan date range.</p>
              {ramadanEnabled ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Ramadan start date" htmlFor="settings-ramadan-start" error={settingsForm.formState.errors.ramadanStartDate?.message}>
                    <Input id="settings-ramadan-start" type="date" {...settingsForm.register("ramadanStartDate")} />
                  </FormField>
                  <FormField label="Ramadan end date" htmlFor="settings-ramadan-end" error={settingsForm.formState.errors.ramadanEndDate?.message}>
                    <Input id="settings-ramadan-end" type="date" {...settingsForm.register("ramadanEndDate")} />
                  </FormField>
                </div>
              ) : null}
            </div>

            {settingsMessage ? <InlineMessage tone={settingsMessage.tone}>{settingsMessage.text}</InlineMessage> : null}

            <StickyActionBar offsetForMobileNav>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <Badge variant={scope === "team" ? "blue" : "subtle"}>{scope === "team" ? "Shared rule set" : "Personal rule set"}</Badge>
                <Button type="submit" size="lg" disabled={isSavingSettings}>
                  {isSavingSettings ? "Saving settings" : "Save settings"}
                </Button>
              </div>
            </StickyActionBar>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <SectionHeader
            eyebrow="Holiday dates"
            title="Holiday schedule"
            description="Public holiday dates can be added manually so rest-day OT is calculated correctly."
          />

          {canManageHolidays ? (
            <form className="space-y-5" onSubmit={onSubmitHoliday}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Holiday date" htmlFor="holiday-date" error={holidayForm.formState.errors.holidayDate?.message}>
                  <Input id="holiday-date" type="date" {...holidayForm.register("holidayDate")} />
                </FormField>
                <FormField label="Label" htmlFor="holiday-label" hint="Optional label such as Eid Holiday." error={holidayForm.formState.errors.label?.message}>
                  <Input id="holiday-label" type="text" placeholder="Eid Holiday" {...holidayForm.register("label")} />
                </FormField>
              </div>
              {holidayMessage ? <InlineMessage tone={holidayMessage.tone}>{holidayMessage.text}</InlineMessage> : null}
              <Button type="submit" variant="secondary" disabled={isSavingHoliday}>
                {isSavingHoliday ? "Saving holiday" : "Add holiday"}
              </Button>
            </form>
          ) : (
            <InlineMessage tone="info">Holiday dates are only needed in the team workflow. Individual users do not need a separate holiday list.</InlineMessage>
          )}

          {holidays.length ? (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <ListRow
                  key={holiday.id}
                  title={formatOvertimeDate(holiday.date)}
                  subtitle={holiday.label || "Public holiday flag"}
                  actions={
                    canManageHolidays ? (
                      <ConfirmationDialog
                        title="Remove holiday date?"
                        description="This will stop treating work on this date as a holiday in the OT calculation."
                        confirmLabel={isDeletingHolidayId === holiday.id ? "Removing..." : "Remove holiday"}
                        onConfirm={async () => {
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
                        trigger={
                          <Button type="button" variant="outline" size="sm" disabled={isDeletingHolidayId === holiday.id}>
                            Remove
                          </Button>
                        }
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No holiday dates added yet"
              description="Add only the dates your team needs for overtime treatment."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
