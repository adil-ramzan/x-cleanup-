import { formatDate, formatDateTime, formatRelative } from '../../utils/format';

export function DateCell({ iso }: { iso: string }) {
  return (
    <div className="whitespace-nowrap">
      <time dateTime={iso} title={formatDateTime(iso)} className="text-sm text-slate-700">
        {formatDate(iso)}
      </time>
      <div className="text-xs text-slate-400">{formatRelative(iso)}</div>
    </div>
  );
}
