import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="pb-20">
      <section className="pt-8 md:pt-12">
        <div className="container">
          <Card className="overflow-hidden border-white/85 bg-white/88">
            <CardContent className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
              <div className="space-y-5">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-16 w-full max-w-3xl" />
                <Skeleton className="h-6 w-full max-w-2xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-36" />
                  <Skeleton className="h-12 w-40" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-44 w-full rounded-[1.8rem]" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-28 w-full rounded-[1.5rem]" />
                  <Skeleton className="h-28 w-full rounded-[1.5rem]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="container grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="space-y-4">
                <Skeleton className="h-14 w-14 rounded-[1.2rem]" />
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-16 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full rounded-[1.2rem]" />
                <Skeleton className="h-14 w-full rounded-[1.2rem]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}