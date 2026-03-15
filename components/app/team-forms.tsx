"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { createTeamAction, joinTeamAction, regenerateJoinCodeAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineMessage } from "@/components/ui/inline-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getDefaultWeekendDays,
  overtimeCalculationModes,
  weekendDayOptions,
} from "@/lib/overtime";
import { createTeamSchema, joinTeamSchema, type CreateTeamValues, type JoinTeamValues } from "@/lib/validation/team";

export function CreateTeamForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      calculationMode: "simple",
      standardDailyHours: "8",
      fixedHourlyRate: "",
      weekendDays: getDefaultWeekendDays(),
      ramadanEnabled: false,
      ramadanStartDate: "",
      ramadanEndDate: "",
    },
  });

  const calculationMode = watch("calculationMode");
  const ramadanEnabled = watch("ramadanEnabled");

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await createTeamAction(values);

      if (result.status === "error") {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, error]) => {
            if (error) {
              setError(field as keyof CreateTeamValues, { message: error });
            }
          });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }

      reset({
        name: "",
        calculationMode: "simple",
        standardDailyHours: "8",
        fixedHourlyRate: "",
        weekendDays: getDefaultWeekendDays(),
        ramadanEnabled: false,
        ramadanStartDate: "",
        ramadanEndDate: "",
      });
      setMessage({ tone: "success", text: result.message });
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormField label="Team name" htmlFor="team-name" hint="Use a clear operational name people recognize immediately." error={errors.name?.message}>
        <Input id="team-name" type="text" placeholder="Main Warehouse" {...register("name")} />
      </FormField>

      <div className="space-y-5 rounded-3xl border border-border bg-slate-50 p-5">
        <div className="space-y-1">
          <p className="text-base font-semibold text-text-primary">Initial overtime setup</p>
          <p className="text-sm leading-6 text-text-secondary">These defaults apply right away and can be updated later from the OT settings tab.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Calculation mode" htmlFor="team-ot-mode" error={errors.calculationMode?.message}>
            <Select id="team-ot-mode" {...register("calculationMode")}>
              {overtimeCalculationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Standard daily hours" htmlFor="team-standard-hours" hint="8 hours is the most common default." error={errors.standardDailyHours?.message}>
            <Input id="team-standard-hours" type="number" step="0.5" min="1" max="24" placeholder="8" {...register("standardDailyHours")} />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Simple mode hourly rate"
            htmlFor="team-fixed-rate"
            hint={calculationMode === "simple" ? "Required when using Simple Mode." : "Worker salary is set later for compliant mode."}
            error={errors.fixedHourlyRate?.message}
          >
            <Input id="team-fixed-rate" type="number" step="0.01" min="0" placeholder="18" {...register("fixedHourlyRate")} />
          </FormField>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-text-primary">Weekend days</p>
            <p className="text-sm text-text-muted">Used as rest days for compliant overtime calculations.</p>
            <div className="grid gap-3 rounded-3xl border border-border bg-white p-4 sm:grid-cols-2">
              {weekendDayOptions.map((day) => (
                <label key={day.value} className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-text-secondary transition hover:bg-white">
                  <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-50" {...register("weekendDays")} />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
            {errors.weekendDays?.message ? <InlineMessage tone="error">{errors.weekendDays.message}</InlineMessage> : null}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-white p-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-text-primary">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-50" {...register("ramadanEnabled")} />
            Enable Ramadan hour reduction
          </label>
          <p className="text-sm text-text-secondary">When enabled, compliant mode reduces standard daily hours to 6 during the Ramadan dates below.</p>
          {ramadanEnabled ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Ramadan start date" htmlFor="team-ramadan-start" error={errors.ramadanStartDate?.message}>
                <Input id="team-ramadan-start" type="date" {...register("ramadanStartDate")} />
              </FormField>
              <FormField label="Ramadan end date" htmlFor="team-ramadan-end" error={errors.ramadanEndDate?.message}>
                <Input id="team-ramadan-end" type="date" {...register("ramadanEndDate")} />
              </FormField>
            </div>
          ) : null}
        </div>
      </div>

      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating team" : "Create team"}
      </Button>
    </form>
  );
}

export function JoinTeamForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JoinTeamValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setMessage(null);
    startTransition(async () => {
      const result = await joinTeamAction(values);

      if (result.status === "error") {
        if (result.fieldErrors?.code) {
          setError("code", { message: result.fieldErrors.code });
        }
        setMessage({ tone: "error", text: result.message });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Join code" htmlFor="team-code" hint="Use the 6-character code from a team admin." error={errors.code?.message}>
        <Input id="team-code" type="text" placeholder="AB12CD" className="uppercase" {...register("code")} />
      </FormField>
      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Joining team" : "Join team"}
      </Button>
    </form>
  );
}

export function RegenerateJoinCodeButton() {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await regenerateJoinCodeAction();
            setMessage({
              tone: result.status === "success" ? "success" : "error",
              text: result.status === "success" ? `New join code: ${result.data?.joinCode}` : result.message,
            });
            router.refresh();
          });
        }}
        disabled={isPending}
      >
        {isPending ? "Regenerating" : "Generate new code"}
      </Button>
    </div>
  );
}
