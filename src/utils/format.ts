const dateFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const compactNumber = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso));
export const formatCount = (n: number): string => compactNumber.format(n);

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Relative label by calendar day (local time), e.g. "Yesterday", "5 days ago", "2 months ago". */
export function formatRelative(iso: string, now = new Date()): string {
  const diffDays = Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / 86_400_000);
  if (Math.abs(diffDays) < 30) return relative.format(diffDays, 'day');
  if (Math.abs(diffDays) < 365) return relative.format(Math.round(diffDays / 30), 'month');
  return relative.format(Math.round(diffDays / 365), 'year');
}

export const pluralize = (n: number, singular: string, plural = `${singular}s`): string =>
  `${n.toLocaleString()} ${n === 1 ? singular : plural}`;
