import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { overtimeEntryStatuses, overtimeRangeOptions } from "@/lib/overtime";

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";

type WorkerOption = {
  id: string;
  name: string;
};

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
  return (
    <Card>
      <CardHeader className="border-b border-slate-100 pb-5">
        <CardTitle className="text-2xl">Entry filters</CardTitle>
        <p className="text-sm leading-6 text-slate-600">Refine entries by date range, status, and worker. Export uses the currently visible result set.</p>
      </CardHeader>
      <CardContent className="pt-6">
        <form action="/app/overtime" className="grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr_1fr_auto] xl:items-end">
          <input type="hidden" name="tab" value={tab} />
          <div className="space-y-2">
            <label htmlFor="overtime-range" className="text-sm font-semibold text-slate-900">Range</label>
            <select id="overtime-range" name="range" defaultValue={filters.range} className={selectClasses}>
              {overtimeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
            <div className="space-y-2">
              <label htmlFor="overtime-from" className="text-sm font-semibold text-slate-900">From</label>
              <Input id="overtime-from" name="from" type="date" defaultValue={filters.from} />
            </div>
            <div className="space-y-2">
              <label htmlFor="overtime-to" className="text-sm font-semibold text-slate-900">To</label>
              <Input id="overtime-to" name="to" type="date" defaultValue={filters.to} />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="overtime-status" className="text-sm font-semibold text-slate-900">Status</label>
            <select id="overtime-status" name="status" defaultValue={filters.status} className={selectClasses}>
              {overtimeEntryStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          {workers.length ? (
            <div className="space-y-2">
              <label htmlFor="overtime-worker" className="text-sm font-semibold text-slate-900">Worker</label>
              <select id="overtime-worker" name="workerId" defaultValue={filters.workerId} className={selectClasses}>
                <option value="all">All workers</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="workerId" value={filters.workerId} />
          )}
          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button type="submit">Apply filters</Button>
            <Button asChild type="button" variant="outline">
              <Link href={`/app/overtime?tab=${tab}`}>Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}