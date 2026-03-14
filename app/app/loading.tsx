import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 pb-10">
      <Card>
        <CardContent className="space-y-5 pt-7">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-6 w-full max-w-3xl" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-4 pb-4">
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-56" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-[1.5rem]" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-[1.4rem]" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}