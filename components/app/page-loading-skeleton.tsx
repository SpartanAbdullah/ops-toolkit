import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton({
  stats = 4,
  showFilterCard = true,
  panels = 2,
  rows = 4,
}: {
  stats?: number;
  showFilterCard?: boolean;
  panels?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-full max-w-lg" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 w-36 rounded-2xl" />
            <Skeleton className="h-12 w-36 rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      {stats > 0 ? (
        <div className={`grid gap-4 ${stats > 2 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2"}`}>
          {Array.from({ length: stats }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-5 sm:p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {showFilterCard ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-44" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-2xl" />
                ))}
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-12 w-24 rounded-2xl" />
                <Skeleton className="h-12 w-24 rounded-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className={`grid gap-6 ${panels > 1 ? "xl:grid-cols-2" : ""}`}>
        {Array.from({ length: panels }).map((_, panelIndex) => (
          <Card key={panelIndex}>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-44" />
              {Array.from({ length: rows }).map((__, rowIndex) => (
                <Skeleton key={rowIndex} className="h-24 w-full rounded-3xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
