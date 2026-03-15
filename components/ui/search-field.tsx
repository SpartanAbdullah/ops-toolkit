import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <Input className={cn("pl-11", className)} type="search" {...props} />
    </div>
  );
}
