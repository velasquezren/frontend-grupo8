import { Skeleton } from '@/components/ui/skeleton'

export default function TransferenciasLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Main Grid Structure Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (Accounts & Dest) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Account Grid Skeleton */}
          <div className="border border-border/40 rounded-xl p-6 bg-card/40 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-80 max-w-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* 2. Recipients Skeleton */}
          <div className="border border-border/40 rounded-xl p-6 bg-card/40 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-28" />
              <div className="flex gap-4 overflow-hidden py-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Amount, concept & action) */}
        <div className="lg:col-span-4">
          <div className="border border-border/40 rounded-xl p-6 bg-card/40 h-[480px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-14 w-full rounded-md" />
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full rounded-md" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border/40">
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
