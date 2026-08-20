import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-700/50',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Full-page placeholder that mirrors the real grid, so nothing jumps on load. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading weather data">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
      <span className="sr-only">Loading weather data…</span>
    </div>
  );
}
