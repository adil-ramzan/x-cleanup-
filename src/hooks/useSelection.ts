import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Tracks selected ids within the currently visible set. Ids that drop out of
 * view (e.g. after filtering) are deselected so bulk counts never include
 * hidden items.
 */
export function useSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const visibleKey = visibleIds.join('|');
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(visibleIds);
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
    // visibleKey stands in for visibleIds' contents.
  }, [visibleKey]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someSelected = !allSelected && visibleIds.some((id) => selected.has(id));

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(visibleIds));
  }, [allSelected, visibleKey]);

  const clear = useCallback(() => setSelected(new Set()), []);

  return useMemo(
    () => ({ selected, count: selected.size, allSelected, someSelected, toggle, toggleAll, clear }),
    [selected, allSelected, someSelected, toggle, toggleAll, clear],
  );
}
