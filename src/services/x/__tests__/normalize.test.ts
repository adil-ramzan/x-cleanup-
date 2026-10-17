import { describe, expect, it } from 'vitest';
import type { XTimelineResponse } from '../apiTypes';
import { normalizeTimelinePage } from '../normalize';

const owner = { id: '1', username: 'me', name: 'Me' };

const page: XTimelineResponse = {
  data: [
    {
      id: '100',
      text: 'A plain post',
      created_at: '2026-10-01T10:00:00.000Z',
      public_metrics: { like_count: 3, retweet_count: 1, reply_count: 2, impression_count: 50 },
      attachments: { media_keys: ['3_1'] },
    },
    {
      id: '101',
      text: 'Truncated long post…',
      note_tweet: { text: 'The full long-form text' },
      created_at: '2026-10-02T10:00:00.000Z',
    },
    {
      id: '102',
      text: '@alice agreed!',
      created_at: '2026-10-03T10:00:00.000Z',
      in_reply_to_user_id: '2',
      referenced_tweets: [{ type: 'replied_to', id: '900' }],
      public_metrics: { like_count: 0, retweet_count: 0, reply_count: 0 },
    },
    {
      id: '103',
      text: 'RT @alice: original text that X may shorten',
      created_at: '2026-10-04T10:00:00.000Z',
      referenced_tweets: [{ type: 'retweeted', id: '901' }],
    },
    {
      id: '104',
      text: 'Quoting this',
      created_at: '2026-10-05T10:00:00.000Z',
      referenced_tweets: [{ type: 'quoted', id: '902' }],
    },
  ],
  includes: {
    tweets: [{ id: '901', text: 'original text in full', created_at: '2026-09-30T08:00:00.000Z', author_id: '2' }],
    users: [{ id: '2', username: 'alice', name: 'Alice' }],
  },
  meta: { result_count: 5, next_token: 'abc' },
};

describe('normalizeTimelinePage', () => {
  const { items, warnings } = normalizeTimelinePage(page, owner);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  it('classifies posts, replies, reposts, and treats quote posts as posts', () => {
    expect(items.map((i) => [i.id, i.kind])).toEqual([
      ['100', 'post'],
      ['101', 'post'],
      ['102', 'reply'],
      ['103', 'repost'],
      ['104', 'post'],
    ]);
    expect(warnings).toEqual([]);
  });

  it('preserves ids, timestamps, permalinks, and marks the source as X', () => {
    expect(byId['100']).toMatchObject({
      createdAt: '2026-10-01T10:00:00.000Z',
      source: 'x',
      url: 'https://x.com/me/status/100',
      hasMedia: true,
      engagement: { likes: 3, reposts: 1, replies: 2, views: 50 },
    });
  });

  it('uses note_tweet for long-form text and leaves missing metrics undefined', () => {
    expect(byId['101']).toMatchObject({ text: 'The full long-form text', hasMedia: false });
    expect(byId['101']).not.toHaveProperty('engagement.likes');
  });

  it('resolves reply targets and repost originals from includes', () => {
    expect(byId['102']).toMatchObject({ inReplyTo: { handle: 'alice', displayName: 'Alice' } });
    expect(byId['103']).toMatchObject({
      original: {
        id: '901',
        text: 'original text in full',
        postedAt: '2026-09-30T08:00:00.000Z',
        author: { handle: 'alice', displayName: 'Alice' },
        url: 'https://x.com/alice/status/901',
      },
    });
  });

  it('accepts includes under the newer "posts" key', () => {
    const alt = normalizeTimelinePage({ ...page, includes: { ...page.includes, tweets: undefined, posts: page.includes!.tweets } }, owner);
    expect(alt.items.find((i) => i.id === '103')).toMatchObject({ original: { text: 'original text in full' } });
  });

  it('falls back to the RT preview and warns when the original is unavailable', () => {
    const res = normalizeTimelinePage(
      {
        data: [{ id: '200', text: 'RT @bob: preview', created_at: '2026-10-06T00:00:00Z', referenced_tweets: [{ type: 'retweeted', id: '999' }] }],
        errors: [{ title: 'Not Found Error', resource_id: '999' }],
      },
      owner,
    );
    expect(res.items[0]).toMatchObject({
      kind: 'repost',
      original: { author: { handle: 'bob' }, text: 'preview', postedAt: null },
    });
    expect(res.warnings).toEqual([{ kind: 'repost', text: expect.stringMatching(/couldn’t be loaded/) }]);
  });

  it('marks unknown authors as null instead of inventing them', () => {
    const res = normalizeTimelinePage(
      {
        data: [
          { id: '300', text: 'no prefix', created_at: '2026-10-06T00:00:00Z', referenced_tweets: [{ type: 'retweeted', id: '1' }] },
          { id: '301', text: 'reply', created_at: '2026-10-06T00:00:00Z', in_reply_to_user_id: '77' },
        ],
      },
      owner,
    );
    expect(res.items[0]).toMatchObject({ original: { author: null, text: null, url: undefined } });
    expect(res.items[1]).toMatchObject({ kind: 'reply', inReplyTo: null });
  });

  it('skips records without a timestamp and reports them', () => {
    const res = normalizeTimelinePage({ data: [{ id: '400', text: 'x' }] }, owner);
    expect(res.items).toEqual([]);
    expect(res.warnings[0].text).toMatch(/skipped/);
  });

  it('handles empty results', () => {
    expect(normalizeTimelinePage({ meta: { result_count: 0 } }, owner)).toEqual({ items: [], warnings: [] });
    expect(normalizeTimelinePage(null, owner)).toEqual({ items: [], warnings: [] });
  });
});
