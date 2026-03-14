import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pettyCashTransactionTypes } from "@/lib/petty-cash";

const selectClasses = "flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100";

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
    <Card>
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="text-2xl">Ledger filters</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">Refine the visible ledger rows by date, transaction type, category, or reimbursement state. Summary cards stay based on the full ledger.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form action="/app/petty-cash" className="grid gap-4 xl:grid-cols-[1.1fr_1.1fr_1fr_1fr_1fr_auto] xl:items-end">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
            <div className="space-y-2">
              <label htmlFor="petty-cash-from" className="text-sm font-semibold text-slate-900">From</label>
              <Input id="petty-cash-from" name="from" type="date" defaultValue={filters.from ?? ""} />
            </div>
            <div className="space-y-2">
              <label htmlFor="petty-cash-to" className="text-sm font-semibold text-slate-900">To</label>
              <Input id="petty-cash-to" name="to" type="date" defaultValue={filters.to ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-type" className="text-sm font-semibold text-slate-900">Type</label>
            <select id="petty-cash-type" name="type" defaultValue={filters.type ?? "all"} className={selectClasses}>
              <option value="all">All transaction types</option>
              {pettyCashTransactionTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-category" className="text-sm font-semibold text-slate-900">Category</label>
            <select id="petty-cash-category" name="category" defaultValue={filters.category ?? "all"} className={selectClasses}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-reimbursement" className="text-sm font-semibold text-slate-900">Reimbursement</label>
            <select id="petty-cash-reimbursement" name="reimbursement" defaultValue={filters.reimbursement ?? "all"} className={selectClasses}>
              <option value="all">All reimbursement states</option>
              <option value="pending">Pending reimbursement</option>
              <option value="received">Reimbursement received</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button type="submit">Apply filters</Button>
            <Button asChild type="button" variant="outline">
              <Link href="/app/petty-cash">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}