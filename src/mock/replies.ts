import type { ReplyItem, AccountRef } from '../types/content';
import { daysAgo, engagement, SAMPLE_ACCOUNTS as A } from './helpers';

const reply = (
  id: number,
  days: number,
  inReplyTo: AccountRef,
  text: string,
  e: ReturnType<typeof engagement>,
): ReplyItem => ({
  id: `mock-reply-${id}`,
  kind: 'reply',
  source: 'mock',
  createdAt: daysAgo(days, 10 + (id % 11), (id * 13) % 60),
  inReplyTo,
  text,
  engagement: e,
});

export const MOCK_REPLIES: ReplyItem[] = [
  reply(1, 1, A.devNotes, 'This is great. The "why, not what" rule changed how I write them.', engagement(8, 0, 1, 410)),
  reply(2, 2, A.designDaily, 'Saving this for the next time someone asks why we use an 8px grid.', engagement(5, 1, 0, 290)),
  reply(3, 6, A.coffeeClub, '1:16 is my default too, but 1:15 for darker roasts.', engagement(3, 0, 2, 180)),
  reply(4, 10, A.trailRunner, 'The second one is gorgeous in autumn. Go early on weekends.', engagement(11, 0, 1, 520)),
  reply(5, 14, A.openSource, 'Thanks for including the changelog links, super helpful.', engagement(2, 0, 0, 140)),
  reply(6, 21, A.bookNook, 'Added two of these to my list already.', engagement(4, 0, 1, 230)),
  reply(7, 30, A.newsDesk, 'Finally! Weekend hours were the one thing missing.', engagement(6, 0, 0, 310)),
  reply(8, 44, A.devNotes, 'Would love a follow-up on error message wording.', engagement(9, 1, 3, 600)),
  reply(9, 60, A.designDaily, 'Counterpoint: sometimes the brand color just will not pass, and that is a conversation to have early.', engagement(14, 2, 5, 880)),
  reply(10, 90, A.coffeeClub, 'Agree, a scale makes a bigger difference than a fancy grinder at first.', engagement(7, 0, 2, 350)),
  reply(11, 133, A.openSource, 'Huge +1. Opened a thank-you issue on a project yesterday.', engagement(20, 3, 1, 1240)),
  reply(12, 210, A.trailRunner, 'Did this loop last year, the views at the top are worth it.', engagement(3, 0, 0, 160)),
  reply(13, 300, A.bookNook, 'Count me in for the book club!', engagement(2, 0, 1, 95)),
  reply(14, 450, A.newsDesk, 'Thanks for the update.', engagement(1, 0, 0, 60)),
];
