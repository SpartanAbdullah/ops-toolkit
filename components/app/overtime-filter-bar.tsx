import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { overtimeEntryStatuses, overtimeRangeOptions } from "@/lib/overtime";

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
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionHeader
          eyebrow="Filters"
          title="Refine visible entries"
          description="Keep the list focused by range, status, and worker."
        />
        <form action="/app/overtime" className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.05fr_1fr_1fr_1fr_auto] xl:items-end">
          <input type="hidden" name="tab" value={tab} />

          <div className="space-y-2">
            <label htmlFor="overtime-range" className="text-sm font-semibold text-text-primary">Range</label>
            <Select id="overtime-range" name="range" defaultValue={filters.range}>
              {overtimeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="overtime-from" className="text-sm font-semibold text-text-primary">From</label>
            <Input id="overtime-from" name="from" type="date" defaultValue={filters.from} />
          </div>

          <div className="space-y-2">
            <label htmlFor="overtime-to" className="text-sm font-semibold text-text-primary">To</label>
            <Input id="overtime-to" name="to" type="date" defaultValue={filters.to} />
          </div>

          <div className="space-y-2">
            <label htmlFor="overtime-status" className="text-sm font-semibold text-text-primary">Status</label>
            <Select id="overtime-status" name="status" defaultValue={filters.status}>
              {overtimeEntryStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </Select>
          </div>

          {workers.length ? (
            <div className="space-y-2">
              <label htmlFor="overtime-worker" className="text-sm font-semibold text-text-primary">Worker</label>
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

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button type="submit">Apply</Button>
            <Button asChild type="button" variant="secondary">
              <Link href={`/app/overtime?tab=${tab}`}>Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
