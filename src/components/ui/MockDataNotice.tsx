import { Icon } from './Icon';

/** Persistent notice that everything shown is local sample data and no X account is connected. */
export function MockDataNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900"
    >
      <Icon name="info" size={16} className="mt-0.5 shrink-0 text-amber-600" />
      <p className={compact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}>
        <span className="font-semibold">Preview mode — sample data only.</span>{' '}
        No X account is connected. Everything shown is placeholder content stored in the extension, and no
        actions are performed on X.
      </p>
    </div>
  );
}
