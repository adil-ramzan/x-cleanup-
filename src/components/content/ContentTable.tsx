import type { ReactNode } from 'react';
import type { ContentItem } from '../../types/content';
import type { RowDensity } from '../../types/settings';
import { cn } from '../../utils/cn';
import { Checkbox } from '../ui/Checkbox';
import type { useSelection } from '../../hooks/useSelection';

export interface Column<T> {
  id: string;
  header: string;
  /** Extra classes for both th and td, e.g. responsive visibility or width. */
  className?: string;
  render: (item: T) => ReactNode;
}

interface ContentTableProps<T extends ContentItem> {
  items: T[];
  columns: Column<T>[];
  selection: ReturnType<typeof useSelection>;
  /** Accessible name for an item's checkbox, e.g. "Select post from Mar 3, 2026". */
  rowLabel: (item: T) => string;
  selectAllLabel: string;
  density: RowDensity;
}

export function ContentTable<T extends ContentItem>({
  items,
  columns,
  selection,
  rowLabel,
  selectAllLabel,
  density,
}: ContentTableProps<T>) {
  const cellY = density === 'compact' ? 'py-2' : 'py-3.5';
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="w-12 py-2.5 pl-4 pr-2">
              <Checkbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                onChange={selection.toggleAll}
                aria-label={selectAllLabel}
              />
            </th>
            {columns.map((col) => (
              <th key={col.id} scope="col" className={cn('px-3 py-2.5 font-medium', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const checked = selection.selected.has(item.id);
            return (
              <tr
                key={item.id}
                onClick={(e) => {
                  // Clicking anywhere on the row toggles it, except on interactive children.
                  if ((e.target as HTMLElement).closest('a, button, input, label')) return;
                  selection.toggle(item.id);
                }}
                className={cn(
                  'cursor-pointer align-top transition-colors',
                  checked ? 'bg-brand-50/60 hover:bg-brand-50' : 'hover:bg-slate-50',
                )}
              >
                <td className={cn('w-12 pl-4 pr-2', cellY)}>
                  <Checkbox
                    checked={checked}
                    onChange={() => selection.toggle(item.id)}
                    aria-label={rowLabel(item)}
                    className="mt-0.5"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.id} className={cn('px-3', cellY, col.className)}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
