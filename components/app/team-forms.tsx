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
import { useToast } from "@/components/ui/toaster";
import {
  getDefaultWeekendDays,
  overtimeCalculationModes,
  weekendDayOptions,
} from "@/lib/overtime";
import { createTeamSchema, joinTeamSchema, type CreateTeamValues, type JoinTeamValues } from "@/lib/validation/team";

export function CreateTeamForm() {
  const router = useRouter();
  const toast = useToast();
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
            if (error) setError(field as keyof CreateTeamValues, { message: error });
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
      toast({
        title: "Team created",
        description: result.data?.joinCode ? `Join code: ${result.data.joinCode}` : undefined,
        tone: "success",
      });
      router.refresh();
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Team name" htmlFor="team-name" hint="A clear name for the workspace." error={errors.name?.message}>
        <Input id="team-name" type="text" placeholder="Main Warehouse" {...register("name")} />
      </FormField>

      <details className="surface-card group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-semibold text-text-primary marker:hidden">
          <span>Initial overtime setup</span>
          <span className="text-2xs uppercase tracking-wide text-text-muted">Tap to configure</span>
        </summary>
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Calculation mode" htmlFor="team-ot-mode" error={errors.calculationMode?.message}>
              <Select id="team-ot-mode" {...register("calculationMode")}>
                {overtimeCalculationModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Standard daily hours" htmlFor="team-standard-hours" error={errors.standardDailyHours?.message}>
              <Input id="team-standard-hours" type="number" step="0.5" min="1" max="24" inputMode="decimal" {...register("standardDailyHours")} />
            </FormField>
          </div>

          <FormField
            label="Simple mode hourly rate (AED)"
            htmlFor="team-fixed-rate"
            hint={calculationMode === "simple" ? "Required for Simple Mode." : "Used only in Simple Mode."}
            error={errors.fixedHourlyRate?.message}
          >
            <Input id="team-fixed-rate" type="number" step="0.01" min="0" placeholder="18" inputMode="decimal" {...register("fixedHourlyRate")} />
          </FormField>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">Weekend days</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {weekendDayOptions.map((day) => (
                <label key={day.value} className="tap-highlight flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-secondary has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700">
                  <input type="checkbox" value={day.value} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-50" {...register("weekendDays")} />
                  <span className="font-medium">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.weekendDays?.message ? <InlineMessage tone="error">{errors.weekendDays.message}</InlineMessage> : null}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
              <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-50" {...register("ramadanEnabled")} />
              Enable Ramadan hour reduction
            </label>
            {ramadanEnabled ? (
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Start" htmlFor="team-ramadan-start" error={errors.ramadanStartDate?.message}>
                  <Input id="team-ramadan-start" type="date" {...register("ramadanStartDate")} />
                </FormField>
                <FormField label="End" htmlFor="team-ramadan-end" error={errors.ramadanEndDate?.message}>
                  <Input id="team-ramadan-end" type="date" {...register("ramadanEndDate")} />
                </FormField>
              </div>
            ) : null}
          </div>
        </div>
      </details>

      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Creating team..." : "Create team"}
      </Button>
    </form>
  );
}

export function JoinTeamForm() {
  const router = useRouter();
  const toast = useToast();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JoinTeamValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: { code: "" },
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
      toast({ title: "Joined team", description: result.data?.teamName, tone: "success" });
      router.refresh();
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField label="Join code" htmlFor="team-code" hint="6 characters, case-insensitive." error={errors.code?.message}>
        <Input id="team-code" type="text" placeholder="AB12CD" className="uppercase tracking-[0.18em] text-center font-display text-lg" {...register("code")} />
      </FormField>
      {message ? <InlineMessage tone={message.tone}>{message.text}</InlineMessage> : null}
      <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Joining..." : "Join team"}
      </Button>
    </form>
  );
}

export function RegenerateJoinCodeButton() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => {
        startTransition(async () => {
          const result = await regenerateJoinCodeAction();
          if (result.status === "success") {
            toast({
              title: "New join code generated",
              description: result.data?.joinCode ? `Active code: ${result.data.joinCode}` : undefined,
              tone: "success",
            });
          } else {
            toast({ title: "Couldn't rotate code", description: result.message, tone: "error" });
          }
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Rotating..." : "Generate new code"}
    </Button>
  );
}
