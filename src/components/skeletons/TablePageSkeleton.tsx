import { Skeleton } from '@/components/ui/skeleton';

export function TablePageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-44" />
      <div className="space-y-2">
        <Skeleton className="h-10 rounded-lg" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
