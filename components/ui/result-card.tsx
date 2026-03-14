import { ArrowUpRight, Calculator, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

type ResultItem = {
  label: string;
  value: string;
};

type ResultCardProps = {
  title?: string;
  amount?: number;
  description: string;
  items?: ResultItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function ResultCard({
  title = "Estimated overtime pay",
  amount,
  description,
  items = [],
  emptyTitle = "Run a calculation",
  emptyDescription = "Enter the salary, hours, and overtime type to generate a clear estimate.",
  className,
}: ResultCardProps) {
  const hasResult = typeof amount === "number" && Number.isFinite(amount);

  return (
    <Card className={cn("min-h-[360px] overflow-hidden", className)}>
      <CardHeader className="border-b border-slate-100/90 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {hasResult ? "Estimate ready" : "Result preview"}
            </p>
            <CardTitle className="mt-2 text-[1.7rem] leading-tight">{hasResult ? title : emptyTitle}</CardTitle>
          </div>
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[1rem] border",
            hasResult ? "border-sky-100 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-50 text-slate-500",
          )}>
            {hasResult ? <Sparkles className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {hasResult ? (
          <>
            <div className="rounded-[1.55rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-sm animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total overtime pay</p>
                  <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.8rem]">
                    {formatCurrency(amount)}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-sky-100 bg-white p-3 text-sky-600 shadow-sm">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {items.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.label} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 transition duration-200 hover:border-slate-200 hover:bg-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[1.55rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white text-slate-500 shadow-sm">
              <Calculator className="h-6 w-6" />
            </div>
            <p className="mt-5 font-display text-2xl font-semibold text-slate-900">{emptyTitle}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{emptyDescription}</p>
            <div className="mt-6 grid w-full max-w-sm gap-3 sm:grid-cols-2">
              {[
                "Salary-based estimate",
                "Clear rate explanation",
                "Result breakdown",
                "Mobile-friendly layout",
              ].map((item) => (
                <div key={item} className="rounded-[1rem] border border-slate-100 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}