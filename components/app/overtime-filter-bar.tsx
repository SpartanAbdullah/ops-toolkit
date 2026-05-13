"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { overtimeEntryStatuses, overtimeRangeOptions } from "@/lib/overtime";

type WorkerOption = {
  id: string;
  name: string;
};

const QUICK_STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "auto_approved", label: "Auto" },
  { value: "rejected", label: "Rejected" },
];

export function OvertimeFilterBar({
  filters,
  workers,
  tab,
}: {
  filters: {
    range: string;
    from: string;
    to: string;
    status: string;
    workerId: string;
  };
  workers: WorkerOption[];
  tab: string;
}) {
  const router = useRouter();

  function applyStatus(value: string) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (filters.range && filters.range !== "this_month") params.set("range", filters.range);
    if (filters.workerId && filters.workerId !== "all") params.set("workerId", filters.workerId);
    if (value !== "all") params.set("status", value);
    router.push(`/app/overtime?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      {/* Status chip row — scrollable on mobile */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          {QUICK_STATUSES.map((status) => {
            const active = filters.status === status.value;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => applyStatus(status.value)}
                className={cn(
                  "tap-highlight inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-primary-600 text-white shadow-sm"
                    : "border border-border bg-white text-text-secondary hover:border-primary-200 hover:text-text-primary",
                )}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed filter form */}
      <details className="surface-card group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-semibold text-text-primary marker:hidden">
          <span>More filters</span>
          <span className="text-2xs uppercase tracking-wide text-text-muted group-open:hidden">Open</span>
          <span className="text-2xs uppercase tracking-wide text-text-muted hidden group-open:inline">Close</span>
        </summary>
        <form action="/app/overtime" className="grid gap-3 border-t border-border p-4 md:grid-cols-2">
          <input type="hidden" name="tab" value={tab} />

          <div className="space-y-1.5">
            <label htmlFor="overtime-range" className="text-xs font-semibold text-text-primary">Date range</label>
            <Select id="overtime-range" name="range" defaultValue={filters.range}>
              {overtimeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="overtime-status" className="text-xs font-semibold text-text-primary">Status</label>
            <Select id="overtime-status" name="status" defaultValue={filters.status}>
              {overtimeEntryStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="overtime-from" className="text-xs font-semibold text-text-primary">From</label>
            <Input id="overtime-from" name="from" type="date" defaultValue={filters.from} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="overtime-to" className="text-xs font-semibold text-text-primary">To</label>
            <Input id="overtime-to" name="to" type="date" defaultValue={filters.to} />
          </div>

          {workers.length ? (
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="overtime-worker" className="text-xs font-semibold text-text-primary">Worker</label>
              <Select id="overtime-worker" name="workerId" defaultValue={filters.workerId}>
                <option value="all">All workers</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </Select>
            </div>
          ) : (
            <input type="hidden" name="workerId" value={filters.workerId} />
          )}

          <div className="flex gap-2 md:col-span-2">
            <Button asChild type="button" variant="secondary" className="flex-1">
              <Link href={`/app/overtime?tab=${tab}`}>Reset</Link>
            </Button>
            <Button type="submit" className="flex-1">Apply</Button>
          </div>
        </form>
      </details>
    </div>
  );
}
