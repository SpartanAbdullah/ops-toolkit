"use client";

import { useState, useTransition } from "react";
import { Calculator, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { ResultCard } from "@/components/ui/result-card";
import { cn, formatCurrency } from "@/lib/utils";

type OvertimeType = "standard" | "night" | "weekend" | "holiday" | "flat-rate";

type FormState = {
  basicSalary: string;
  dailyWorkingHours: string;
  overtimeHours: string;
  overtimeType: OvertimeType;
  customHourlyRate: string;
};

type CalculationResult = {
  amount: number;
  explanation: string;
  breakdown: { label: string; value: string }[];
  formulaLines: string[];
};

const overtimeRules: Record<
  OvertimeType,
  {
    label: string;
    helper: string;
    multiplier?: number;
    summary: string;
  }
> = {
  standard: {
    label: "Standard working day overtime",
    helper: "Uses the estimated hourly rate with a 25% overtime premium.",
    multiplier: 1.25,
    summary: "+25% premium",
  },
  night: {
    label: "Night overtime",
    helper: "Uses the estimated hourly rate with a 50% premium for night work.",
    multiplier: 1.5,
    summary: "+50% premium",
  },
  weekend: {
    label: "Weekend / rest day overtime",
    helper: "Estimated with a 50% premium when no substitute rest day is granted.",
    multiplier: 1.5,
    summary: "Rest day estimate",
  },
  holiday: {
    label: "Public holiday overtime",
    helper: "Estimated with a 50% premium when no substitute day off is granted.",
    multiplier: 1.5,
    summary: "Holiday estimate",
  },
  "flat-rate": {
    label: "Company flat hourly rate mode",
    helper: "Uses your internal overtime hourly rate instead of the salary-based estimate.",
    summary: "Custom company rate",
  },
};

const initialForm: FormState = {
  basicSalary: "",
  dailyWorkingHours: "8",
  overtimeHours: "",
  overtimeType: "standard",
  customHourlyRate: "",
};

export function OvertimeCalculator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const basicSalary = Number(form.basicSalary);
    const dailyWorkingHours = Number(form.dailyWorkingHours);
    const overtimeHours = Number(form.overtimeHours);
    const customHourlyRate = Number(form.customHourlyRate);

    if (!Number.isFinite(basicSalary) || basicSalary <= 0) {
      nextErrors.basicSalary = "Enter a valid monthly basic salary greater than zero.";
    }

    if (!Number.isFinite(dailyWorkingHours) || dailyWorkingHours <= 0 || dailyWorkingHours > 12) {
      nextErrors.dailyWorkingHours = "Enter daily working hours between 1 and 12.";
    }

    if (!Number.isFinite(overtimeHours) || overtimeHours <= 0 || overtimeHours > 16) {
      nextErrors.overtimeHours = "Enter overtime hours greater than 0 and up to 16.";
    }

    if (form.overtimeType === "flat-rate" && (!Number.isFinite(customHourlyRate) || customHourlyRate <= 0)) {
      nextErrors.customHourlyRate = "Enter the company overtime hourly rate.";
    }

    return {
      nextErrors,
      values: {
        basicSalary,
        dailyWorkingHours,
        overtimeHours,
        customHourlyRate,
      },
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { nextErrors, values } = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setResult(null);
      return;
    }

    startTransition(() => {
      const rule = overtimeRules[form.overtimeType];
      const baseHourlyRate = values.basicSalary / 30 / values.dailyWorkingHours;
      const effectiveHourlyRate = form.overtimeType === "flat-rate" ? values.customHourlyRate : baseHourlyRate;
      const multiplier = form.overtimeType === "flat-rate" ? 1 : rule.multiplier ?? 1;
      const amount = effectiveHourlyRate * values.overtimeHours * multiplier;
      const basePayPortion = baseHourlyRate * values.overtimeHours;
      const premiumPortion = amount - basePayPortion;

      const explanation =
        form.overtimeType === "flat-rate"
          ? `Using your company overtime rate of ${formatCurrency(values.customHourlyRate)} per hour for ${values.overtimeHours} hours, the estimated overtime pay is ${formatCurrency(amount)}.`
          : `Using a base hourly rate of ${formatCurrency(baseHourlyRate)} derived from ${formatCurrency(values.basicSalary)} monthly basic salary divided by 30 days and divided by ${values.dailyWorkingHours} daily hours, the selected rule applies ${rule.multiplier === 1.25 ? "a 25% premium" : "a 50% premium"}. The estimated overtime pay for ${values.overtimeHours} hours is ${formatCurrency(amount)}.`;

      const formulaLines =
        form.overtimeType === "flat-rate"
          ? [
              `Company overtime rate = ${formatCurrency(values.customHourlyRate)} per hour`,
              `Hours entered = ${values.overtimeHours}`,
              `Estimated overtime pay = rate x hours = ${formatCurrency(amount)}`,
            ]
          : [
              `Base hourly rate = ${formatCurrency(values.basicSalary)} / 30 / ${values.dailyWorkingHours} = ${formatCurrency(baseHourlyRate)}`,
              `Base pay portion = ${formatCurrency(baseHourlyRate)} x ${values.overtimeHours} = ${formatCurrency(basePayPortion)}`,
              `Estimated overtime pay = ${formatCurrency(baseHourlyRate)} x ${values.overtimeHours} x ${multiplier.toFixed(2)} = ${formatCurrency(amount)}`,
              `Premium portion = ${formatCurrency(premiumPortion)}`,
            ];

      setResult({
        amount,
        explanation,
        breakdown: [
          { label: "Selected overtime type", value: rule.label },
          { label: "Hours entered", value: `${values.overtimeHours} hours` },
          { label: "Rate used", value: formatCurrency(effectiveHourlyRate) },
          {
            label: form.overtimeType === "flat-rate" ? "Calculation mode" : "Multiplier",
            value: form.overtimeType === "flat-rate" ? "Company policy rate" : `x${multiplier.toFixed(2)}`,
          },
        ],
        formulaLines,
      });
    });
  }

  function handleReset() {
    setForm(initialForm);
    setErrors({});
    setResult(null);
  }

  const selectedRule = overtimeRules[form.overtimeType];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <IconTile icon={Calculator} tone="blue" size="lg" />
            <div className="space-y-3">
              <span className="hero-chip bg-white/92 text-slate-700">Trustworthy payroll estimate</span>
              <CardTitle className="text-[1.85rem] leading-tight">Estimate overtime with a visible rule basis</CardTitle>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Enter the employee&apos;s monthly basic salary, working hours, and overtime type. The calculator keeps the rate basis and applied rule visible so the result is easier to review internally.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-7">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="space-y-5">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Pay basis</p>
                <p className="text-sm text-slate-600">Use the employee&apos;s basic salary only, not allowances or total package.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Monthly basic salary" htmlFor="basicSalary" hint="Enter the employee's basic salary in AED." error={errors.basicSalary}>
                  <Input
                    id="basicSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.basicSalary}
                    onChange={(event) => updateField("basicSalary", event.target.value)}
                    placeholder="e.g. 3500"
                  />
                </FormField>
                <FormField label="Daily working hours" htmlFor="dailyWorkingHours" hint="Used to estimate the hourly rate from monthly salary." error={errors.dailyWorkingHours}>
                  <Input
                    id="dailyWorkingHours"
                    type="number"
                    min="1"
                    max="12"
                    step="0.25"
                    value={form.dailyWorkingHours}
                    onChange={(event) => updateField("dailyWorkingHours", event.target.value)}
                    placeholder="e.g. 8"
                  />
                </FormField>
              </div>
            </section>

            <section className="space-y-5">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Overtime event</p>
                <p className="text-sm text-slate-600">Choose the closest applicable rule basis and enter the total overtime hours to estimate.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Overtime type" htmlFor="overtimeType" hint="Select the work condition being estimated.">
                  <select
                    id="overtimeType"
                    className="flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    value={form.overtimeType}
                    onChange={(event) => updateField("overtimeType", event.target.value as OvertimeType)}
                  >
                    {Object.entries(overtimeRules).map(([value, rule]) => (
                      <option key={value} value={value}>
                        {rule.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Overtime hours" htmlFor="overtimeHours" hint="Total hours to be estimated." error={errors.overtimeHours}>
                  <Input
                    id="overtimeHours"
                    type="number"
                    min="0"
                    max="16"
                    step="0.25"
                    value={form.overtimeHours}
                    onChange={(event) => updateField("overtimeHours", event.target.value)}
                    placeholder="e.g. 2.5"
                  />
                </FormField>
              </div>
            </section>

            <div className="rounded-[1.45rem] border border-slate-100 bg-slate-50/85 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Applicable rule</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{selectedRule.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedRule.helper}</p>
                </div>
                <div className="rounded-full border border-white/90 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                  {selectedRule.summary}
                </div>
              </div>
            </div>

            <div className={cn("grid transition-all duration-300", form.overtimeType === "flat-rate" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <div className="pt-1">
                  <FormField label="Company flat hourly rate" htmlFor="customHourlyRate" hint="Use this only when your company policy uses a fixed overtime rate per hour." error={errors.customHourlyRate}>
                    <Input
                      id="customHourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.customHourlyRate}
                      onChange={(event) => updateField("customHourlyRate", event.target.value)}
                      placeholder="e.g. 25"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Calculating..." : "Calculate overtime pay"}
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={handleReset}>
                Clear form
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Inputs stay in this session while you review the estimate.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ResultCard
          amount={result?.amount}
          description={result?.explanation ?? "Enter the details on the left to generate a salary-based overtime estimate with a clear formula breakdown and visible rule basis."}
          items={result?.breakdown}
          emptyTitle="Awaiting calculation"
          emptyDescription="The result area will show the overtime total, the selected overtime type, the hours entered, and the rate used once you submit the form."
        />

        <Card>
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="text-xl">How the estimate is derived</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {(result?.formulaLines ?? [
              "Base hourly rate = monthly basic salary divided by 30 days and divided by daily working hours.",
              "Standard day overtime then applies a 25% premium; night, rest day, and public holiday estimates use a 50% premium.",
              "Flat rate mode skips the salary-based formula and uses your company-set hourly rate instead.",
            ]).map((line) => (
              <div key={line} className="rounded-[1.15rem] border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                {line}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}