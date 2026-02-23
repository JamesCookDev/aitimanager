import { Skeleton } from '@/components/ui/skeleton';

export function EditorSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-52 border-r border-border p-3 space-y-2">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="w-[420px] h-[680px] rounded-xl" />
      </div>
      <div className="w-72 border-l border-border p-3 space-y-3">
        <Skeleton className="h-8 rounded" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
      </div>
    </div>
  );
}
