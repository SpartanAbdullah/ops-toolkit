import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { pettyCashTransactionTypes } from "@/lib/petty-cash";

export function PettyCashFilterBar({
  filters,
  categories,
}: {
  filters: {
    from?: string;
    to?: string;
    type?: string;
    category?: string;
    reimbursement?: string;
  };
  categories: string[];
}) {
  return (
    <details className="surface-card group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-semibold text-text-primary marker:hidden">
        <span>Filters</span>
        <span className="text-2xs uppercase tracking-wide text-text-muted">Tap to refine</span>
      </summary>
      <form action="/app/petty-cash" className="grid gap-3 border-t border-border p-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="petty-cash-from" className="text-xs font-semibold text-text-primary">From</label>
          <Input id="petty-cash-from" name="from" type="date" defaultValue={filters.from ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="petty-cash-to" className="text-xs font-semibold text-text-primary">To</label>
          <Input id="petty-cash-to" name="to" type="date" defaultValue={filters.to ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="petty-cash-type" className="text-xs font-semibold text-text-primary">Type</label>
          <Select id="petty-cash-type" name="type" defaultValue={filters.type ?? "all"}>
            <option value="all">All types</option>
            {pettyCashTransactionTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="petty-cash-category" className="text-xs font-semibold text-text-primary">Category</label>
          <Select id="petty-cash-category" name="category" defaultValue={filters.category ?? "all"}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="petty-cash-reimbursement" className="text-xs font-semibold text-text-primary">Reimbursement</label>
          <Select id="petty-cash-reimbursement" name="reimbursement" defaultValue={filters.reimbursement ?? "all"}>
            <option value="all">All states</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
          </Select>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button asChild type="button" variant="secondary" className="flex-1">
            <Link href="/app/petty-cash">Reset</Link>
          </Button>
          <Button type="submit" className="flex-1">Apply</Button>
        </div>
      </form>
    </details>
  );
}
