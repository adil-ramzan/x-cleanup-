export type DateRangePreset = 'all' | '7d' | '30d' | '90d' | '365d' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  /** yyyy-mm-dd, inclusive. Only used when preset is 'custom'. */
  from: string;
  /** yyyy-mm-dd, inclusive. Only used when preset is 'custom'. */
  to: string;
}

export interface ContentFilters {
  query: string;
  dateRange: DateRange;
}
