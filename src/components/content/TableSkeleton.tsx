import { Skeleton } from '../ui/Skeleton';

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <div className="flex h-10 items-center gap-4 border-b border-slate-200 bg-slate-50/80 px-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-start gap-4 px-4 py-4">
            <Skeleton className="h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5" />
              <Skeleton className={i % 2 ? 'h-3.5 w-1/2' : 'h-3.5 w-3/4'} />
            </div>
            <Skeleton className="hidden h-3.5 w-24 sm:block" />
            <Skeleton className="hidden h-3.5 w-28 lg:block" />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
