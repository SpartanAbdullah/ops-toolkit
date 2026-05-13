import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton({
  stats = 2,
  rows = 4,
}: {
  stats?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {stats > 0 ? (
        <div className={`grid gap-3 ${stats > 2 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
          {Array.from({ length: stats }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    </div>
  );
}
