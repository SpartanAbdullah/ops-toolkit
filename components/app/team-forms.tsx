"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { createTeamAction, joinTeamAction, regenerateJoinCodeAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  getDefaultWeekendDays,
  overtimeCalculationModes,
  weekendDayOptions,
} from "@/lib/overtime";
import { createTeamSchema, joinTeamSchema, type CreateTeamValues, type JoinTeamValues } from "@/lib/validation/team";

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";
const feedbackClasses = {
  success: "rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700",
  error: "rounded-[1.2rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700",
} as const;

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
      <FormField label="Team name" htmlFor="team-name" hint="Examples: Main Warehouse, Admin Ops, Payroll Team." error={errors.name?.message}>
        <Input id="team-name" type="text" placeholder="Main Warehouse" {...register("name")} />
      </FormField>

      <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Initial overtime setup</p>
          <p className="text-sm leading-6 text-slate-600">These defaults will power the overtime module immediately after team creation, and admins can adjust them later.</p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField label="Calculation mode" htmlFor="team-ot-mode" error={errors.calculationMode?.message}>
            <select id="team-ot-mode" className={selectClasses} {...register("calculationMode")}>
              {overtimeCalculationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Standard daily hours" htmlFor="team-standard-hours" hint="8 hours is the default for most teams." error={errors.standardDailyHours?.message}>
            <Input id="team-standard-hours" type="number" step="0.5" min="1" max="24" placeholder="8" {...register("standardDailyHours")} />
          </FormField>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField
            label="Simple mode hourly rate"
            htmlFor="team-fixed-rate"
            hint={calculationMode === "simple" ? "Required for Simple Mode." : "Optional here. Worker basic salary is set later in Members for compliant mode."}
            error={errors.fixedHourlyRate?.message}
          >
            <Input id="team-fixed-rate" type="number" step="0.01" min="0" placeholder="e.g. 18" {...register("fixedHourlyRate")} />
          </FormField>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Weekend days</p>
            <p className="text-xs leading-5 text-slate-500">These days are treated as rest days for compliant overtime calculations.</p>
            <div className="grid gap-3 rounded-[1.3rem] border border-slate-200/80 bg-white/90 p-4 sm:grid-cols-2">
              {weekendDayOptions.map((day) => (
                <label key={day.value} className="flex items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-slate-50/70 px-3 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white">
                  <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" {...register("weekendDays")} />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
            {errors.weekendDays?.message ? <div className={feedbackClasses.error}>{errors.weekendDays.message}</div> : null}
          </div>
        </div>

        <div className="mt-5 space-y-4 rounded-[1.3rem] border border-slate-200/80 bg-white/90 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200" {...register("ramadanEnabled")} />
            Enable Ramadan hour reduction
          </label>
          <p className="text-xs leading-5 text-slate-500">When enabled, the compliant mode will reduce standard daily hours to 6 during the configured Ramadan dates.</p>
          {ramadanEnabled ? (
            <div className="grid gap-5 md:grid-cols-2">
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

      {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}
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
      <FormField label="Join code" htmlFor="team-code" hint="Codes are 6 characters and generated by a team admin." error={errors.code?.message}>
        <Input id="team-code" type="text" placeholder="AB12CD" className="uppercase" {...register("code")} />
      </FormField>
      {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}
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
      {message ? <div className={feedbackClasses[message.tone]}>{message.text}</div> : null}
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