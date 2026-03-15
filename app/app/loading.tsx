import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-full max-w-lg" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-44" />
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <Skeleton key={rowIndex} className="h-24 w-full rounded-3xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
