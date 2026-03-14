import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
  return (
    <div className="pb-20">
      <section className="pt-8 md:pt-12">
        <div className="container">
          <Card>
            <CardContent className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <Skeleton className="h-8 w-36 rounded-full" />
                <Skeleton className="h-16 w-full max-w-3xl" />
                <Skeleton className="h-6 w-full max-w-2xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-44" />
                  <Skeleton className="h-12 w-44" />
                </div>
              </div>
              <Skeleton className="h-56 w-full rounded-[1.8rem]" />
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="py-16">
        <div className="container space-y-6">
          <Card>
            <CardContent className="grid gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-11 w-32 rounded-[1rem]" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-44 w-full rounded-[1.5rem]" />
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="space-y-4">
                  <Skeleton className="h-14 w-14 rounded-[1.2rem]" />
                  <Skeleton className="h-7 w-44" />
                  <Skeleton className="h-16 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-[1.2rem]" />
                  <Skeleton className="h-14 w-full rounded-[1.2rem]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}