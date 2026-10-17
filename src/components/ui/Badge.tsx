import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'brand' | 'amber' | 'green';

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks content as local sample data, never real account data. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge tone="amber" className={className}>
      Sample data
    </Badge>
  );
}

/** Marks content as live data from the connected X account. */
export function LiveBadge({ handle, className }: { handle: string; className?: string }) {
  return (
    <Badge tone="green" className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      Live · @{handle}
    </Badge>
  );
}
