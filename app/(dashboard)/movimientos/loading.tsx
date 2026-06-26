import { Skeleton } from '@/components/ui/skeleton'

export default function MovimientosLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  )
}
