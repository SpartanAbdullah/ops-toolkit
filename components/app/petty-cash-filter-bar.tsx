import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
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
    <Card>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionHeader
          eyebrow="Filters"
          title="Refine the ledger"
          description="Narrow the list by date, category, type, or reimbursement state."
        />
        <form action="/app/petty-cash" className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] xl:items-end">
          <div className="space-y-2">
            <label htmlFor="petty-cash-from" className="text-sm font-semibold text-text-primary">From</label>
            <Input id="petty-cash-from" name="from" type="date" defaultValue={filters.from ?? ""} />
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-to" className="text-sm font-semibold text-text-primary">To</label>
            <Input id="petty-cash-to" name="to" type="date" defaultValue={filters.to ?? ""} />
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-type" className="text-sm font-semibold text-text-primary">Type</label>
            <Select id="petty-cash-type" name="type" defaultValue={filters.type ?? "all"}>
              <option value="all">All transaction types</option>
              {pettyCashTransactionTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-category" className="text-sm font-semibold text-text-primary">Category</label>
            <Select id="petty-cash-category" name="category" defaultValue={filters.category ?? "all"}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="petty-cash-reimbursement" className="text-sm font-semibold text-text-primary">Reimbursement</label>
            <Select id="petty-cash-reimbursement" name="reimbursement" defaultValue={filters.reimbursement ?? "all"}>
              <option value="all">All reimbursement states</option>
              <option value="pending">Pending reimbursement</option>
              <option value="received">Reimbursement received</option>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button type="submit">Apply</Button>
            <Button asChild type="button" variant="secondary">
              <Link href="/app/petty-cash">Reset</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
