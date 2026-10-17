import type { AccountRef, Engagement } from '../types/content';

/**
 * Mock timestamps are relative to "now" so the date-range presets
 * (last 7 / 30 / 90 days, …) always have something to show.
 */
export function daysAgo(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function engagement(likes: number, reposts: number, replies: number, views: number): Engagement {
  return { likes, reposts, replies, views };
}

/** Clearly fictional sample accounts — not real X users. */
export const SAMPLE_ACCOUNTS = {
  devNotes: { displayName: 'Sample Dev Notes', handle: 'sample_devnotes' },
  designDaily: { displayName: 'Sample Design Daily', handle: 'sample_design' },
  newsDesk: { displayName: 'Sample News Desk', handle: 'sample_newsdesk' },
  coffeeClub: { displayName: 'Sample Coffee Club', handle: 'sample_coffee' },
  trailRunner: { displayName: 'Sample Trail Runner', handle: 'sample_trails' },
  bookNook: { displayName: 'Sample Book Nook', handle: 'sample_books' },
  openSource: { displayName: 'Sample OSS Weekly', handle: 'sample_oss' },
} satisfies Record<string, AccountRef>;
