import type { PostItem } from '../types/content';
import { daysAgo, engagement } from './helpers';

const post = (
  id: number,
  days: number,
  text: string,
  e: ReturnType<typeof engagement>,
  hasMedia = false,
): PostItem => ({
  id: `mock-post-${id}`,
  kind: 'post',
  source: 'mock',
  createdAt: daysAgo(days, 8 + (id % 12), (id * 7) % 60),
  text,
  hasMedia,
  engagement: e,
});

export const MOCK_POSTS: PostItem[] = [
  post(1, 1, 'Finally shipped the redesign of my personal site. Took way longer than planned, but it feels good to have it out.', engagement(42, 6, 9, 3120), true),
  post(2, 3, 'Hot take: most meetings would be better as a well-written doc with a comment thread.', engagement(118, 24, 31, 9840)),
  post(3, 5, 'Morning run along the river. 8 km, no headphones, highly recommend.', engagement(17, 0, 2, 860), true),
  post(4, 9, 'Reading list for the long weekend: two novels, one history book, and absolutely zero work email.', engagement(23, 2, 5, 1450)),
  post(5, 12, 'Anyone else find that writing tests first makes the API design obviously better?', engagement(64, 9, 22, 5210)),
  post(6, 18, 'New keyboard arrived. My productivity has not improved but my typing sounds incredible.', engagement(88, 7, 14, 6020), true),
  post(7, 26, 'Reminder that "temporary" fixes have a half-life of roughly forever.', engagement(203, 51, 19, 15400)),
  post(8, 34, 'Cooked a proper dinner for the first time in weeks. Pasta, obviously.', engagement(12, 0, 3, 640), true),
  post(9, 47, 'Thread on what I learned migrating a mid-sized app to TypeScript (1/6)', engagement(156, 38, 27, 12800)),
  post(10, 63, 'Rainy day, good coffee, quiet inbox. Rare alignment of the stars.', engagement(29, 1, 4, 1180)),
  post(11, 81, 'Speaking at a local meetup next month about accessible form design. Slides will be public.', engagement(71, 15, 8, 4300)),
  post(12, 102, 'Unpopular opinion: dark mode is not automatically more readable.', engagement(95, 12, 46, 8700)),
  post(13, 140, 'Spent the afternoon cleaning up old side projects. Archived eleven repos. Feels lighter.', engagement(38, 3, 6, 2210)),
  post(14, 196, 'Summer plans: fewer screens, more trails.', engagement(21, 1, 2, 990), true),
  post(15, 251, 'If your onboarding needs a 40-minute video, the product might need another look.', engagement(134, 29, 17, 10100)),
  post(16, 330, 'Year in review draft is done. Mostly lessons about scoping things smaller.', engagement(47, 4, 10, 2870)),
  post(17, 410, 'Testing a new note-taking setup. Plain text files and a good search tool, that is it.', engagement(58, 8, 13, 3650)),
  post(18, 520, 'First post from the new account. Hello!', engagement(9, 0, 4, 310)),
];
