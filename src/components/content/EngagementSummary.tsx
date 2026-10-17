import type { Engagement } from '../../types/content';
import { formatCount } from '../../utils/format';
import { Icon, type IconName } from '../ui/Icon';

const METRICS: { key: keyof Engagement; icon: IconName; label: string }[] = [
  { key: 'likes', icon: 'heart', label: 'likes' },
  { key: 'reposts', icon: 'repost', label: 'reposts' },
  { key: 'replies', icon: 'reply', label: 'replies' },
  { key: 'views', icon: 'eye', label: 'views' },
];

export function EngagementSummary({ engagement }: { engagement?: Engagement }) {
  if (!engagement) return <p className="text-xs text-slate-400">Metrics not available</p>;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
      {METRICS.filter((m) => engagement[m.key] !== undefined).map((m) => (
        <li key={m.key} className="inline-flex items-center gap-1 tabular-nums">
          <Icon name={m.icon} size={12} className="text-slate-400" />
          {formatCount(engagement[m.key] ?? 0)}
          <span className="sr-only"> {m.label}</span>
        </li>
      ))}
    </ul>
  );
}
