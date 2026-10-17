import type { DateRangePreset } from './filters';

export type RowDensity = 'comfortable' | 'compact';

export interface Preferences {
  /** Date range applied when a management page first opens. */
  defaultDateRange: Exclude<DateRangePreset, 'custom'>;
  rowDensity: RowDensity;
  /** Ask for confirmation before bulk actions (enforced once actions exist in a later phase). */
  confirmBeforeBulkActions: boolean;
  /** Show built-in sample data even when an X account is connected. */
  useSampleData: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultDateRange: 'all',
  rowDensity: 'comfortable',
  confirmBeforeBulkActions: true,
  useSampleData: false,
};
