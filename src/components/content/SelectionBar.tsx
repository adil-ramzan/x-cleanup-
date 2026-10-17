import { pluralize } from '../../utils/format';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface SelectionBarProps {
  visibleCount: number;
  totalCount: number;
  selectedCount: number;
  noun: { singular: string; plural: string };
  /** Label of the bulk action reserved for a later phase. */
  actionLabel: string;
  onClear: () => void;
}

/**
 * Result count and bulk-selection summary. The bulk action is deliberately
 * disabled in Phase 1 — no requests are made to X.
 */
export function SelectionBar({ visibleCount, totalCount, selectedCount, noun, actionLabel, onClear }: SelectionBarProps) {
  return (
    <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
      <p className="text-sm text-slate-600" aria-live="polite">
        {selectedCount > 0 ? (
          <span className="font-medium text-slate-900">{selectedCount.toLocaleString()} selected</span>
        ) : visibleCount === totalCount ? (
          pluralize(totalCount, noun.singular, noun.plural)
        ) : (
          <>
            Showing {visibleCount.toLocaleString()} of {pluralize(totalCount, noun.singular, noun.plural)}
          </>
        )}
      </p>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear selection
          </Button>
          <Button variant="danger" size="sm" disabled aria-describedby="bulk-action-note">
            <Icon name="trash" size={13} />
            {actionLabel}
          </Button>
          <span id="bulk-action-note" className="text-xs text-slate-400">
            Available in a later phase
          </span>
        </div>
      )}
    </div>
  );
}
