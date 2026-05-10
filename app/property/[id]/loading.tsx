import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
      <Skeleton className="h-4 w-28 mb-6" />

      {/* Photo gallery skeleton */}
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="flex gap-2 mt-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-20 h-14 rounded-lg shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          <div className="rounded-xl border p-4 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-5 w-28" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="w-full aspect-video rounded-xl" />
        </div>
      </div>
    </div>
  );
}
