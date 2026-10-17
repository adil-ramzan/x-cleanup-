import type { RepostItem, AccountRef } from '../types/content';
import { daysAgo, SAMPLE_ACCOUNTS as A } from './helpers';

const repost = (id: number, days: number, author: AccountRef, text: string, originalDaysAgo = days): RepostItem => ({
  id: `mock-repost-${id}`,
  kind: 'repost',
  source: 'mock',
  createdAt: daysAgo(days, 9 + (id % 10), (id * 11) % 60),
  original: { author, text, postedAt: daysAgo(originalDaysAgo, 7) },
});

export const MOCK_REPOSTS: RepostItem[] = [
  repost(1, 2, A.devNotes, 'A small guide to writing commit messages future-you will thank you for.', 3),
  repost(2, 4, A.designDaily, 'Spacing systems explained with one diagram. Bookmark this.', 4),
  repost(3, 8, A.openSource, 'This week in open source: three new releases worth a look.', 9),
  repost(4, 15, A.coffeeClub, 'Pour-over ratios, demystified. Start at 1:16 and adjust from there.', 16),
  repost(5, 22, A.newsDesk, 'Local library extends weekend hours starting next month.', 22),
  repost(6, 39, A.trailRunner, 'Five beginner-friendly trails within an hour of the city.', 41),
  repost(7, 55, A.bookNook, 'Our staff picks for autumn are in. Lots of slow, cozy reads.', 57),
  repost(8, 77, A.devNotes, 'Accessibility checklist for forms: labels, errors, focus order, and contrast.', 80),
  repost(9, 120, A.designDaily, 'Color contrast is not a vibe, it is a ratio. Check it.', 121),
  repost(10, 188, A.openSource, 'Maintainers are people. Say thanks when a library saves you a week.', 190),
  repost(11, 275, A.coffeeClub, 'Cold brew season is officially open.', 276),
  repost(12, 400, A.bookNook, 'Book club pick for the month announced. Join the thread!', 402),
];
