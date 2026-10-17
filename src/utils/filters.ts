import type { ContentItem } from '../types/content';
import type { ContentFilters, DateRange, DateRangePreset } from '../types/filters';

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' },
];

const PRESET_DAYS: Partial<Record<DateRangePreset, number>> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };

export function emptyDateRange(preset: DateRangePreset = 'all'): DateRange {
  return { preset, from: '', to: '' };
}

/** Parses a yyyy-mm-dd string as a local date. */
function parseLocalDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Returns inclusive [start, end] epoch-ms bounds; null means unbounded. */
export function dateRangeBounds(range: DateRange, now = new Date()): { start: number | null; end: number | null } {
  if (range.preset === 'custom') {
    const from = parseLocalDate(range.from);
    const to = parseLocalDate(range.to);
    return {
      start: from ? from.getTime() : null,
      // End of the selected day.
      end: to ? to.getTime() + 86_400_000 - 1 : null,
    };
  }
  const days = PRESET_DAYS[range.preset];
  if (!days) return { start: null, end: null };
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start: start.getTime(), end: null };
}

export function isCustomRangeInvalid(range: DateRange): boolean {
  return range.preset === 'custom' && !!range.from && !!range.to && range.from > range.to;
}

/** All user-visible text for an item, lowercased, for client-side search. */
function searchableText(item: ContentItem): string {
  switch (item.kind) {
    case 'post':
      return item.text.toLowerCase();
    case 'reply':
      return [item.text, item.inReplyTo && `@${item.inReplyTo.handle} ${item.inReplyTo.displayName}`]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    case 'repost':
      return [item.original.text, item.original.author && `@${item.original.author.handle} ${item.original.author.displayName}`]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
  }
}

export function filterItems<T extends ContentItem>(items: T[], filters: ContentFilters): T[] {
  const query = filters.query.trim().toLowerCase();
  const { start, end } = dateRangeBounds(filters.dateRange);
  return items
    .filter((item) => {
      const t = new Date(item.createdAt).getTime();
      if (start !== null && t < start) return false;
      if (end !== null && t > end) return false;
      return !query || searchableText(item).includes(query);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
