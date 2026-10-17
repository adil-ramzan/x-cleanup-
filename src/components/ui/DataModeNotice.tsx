import { useActiveContentSource } from '../../dashboard/contentSourceContext';
import { LiveBadge, SampleBadge } from './Badge';
import { Icon } from './Icon';
import { MockDataNotice } from './MockDataNotice';

/** Page-level notice stating whether the page shows sample data or the connected account's real data. */
export function DataModeNotice() {
  const { account } = useActiveContentSource();
  if (!account) return <MockDataNotice />;
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-900"
    >
      <Icon name="info" size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">Live data from @{account.username}.</span> Records are read from X’s official
        API in read-only mode — nothing is changed on X.
      </p>
    </div>
  );
}

export function DataModeBadge() {
  const { account } = useActiveContentSource();
  return account ? <LiveBadge handle={account.username} /> : <SampleBadge />;
}
