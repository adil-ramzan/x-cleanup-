import { describe, expect, it, vi } from 'vitest';
import type { XTimelineResponse } from '../x/apiTypes';
import { createLiveContentSource } from '../liveContentSource';
import { XError } from '../x/errors';

const account = { id: '1', username: 'me', name: 'Me' };
const post = (id: string, extra: object = {}) => ({ id, text: `post ${id}`, created_at: `2026-10-0${id.slice(-1)}T00:00:00Z`, ...extra });

describe('createLiveContentSource', () => {
  it('fetches the first page once and serves every kind from the shared cache', async () => {
    const fetchPage = vi.fn<(id: string, token?: string) => Promise<XTimelineResponse>>().mockResolvedValue({
      data: [post('1'), post('2', { in_reply_to_user_id: '9' }), post('3', { referenced_tweets: [{ type: 'retweeted', id: '8' }] })],
      meta: { next_token: 'p2' },
    });
    const source = createLiveContentSource(account, fetchPage);
    const [posts, replies, reposts] = await Promise.all([source.list('post'), source.list('reply'), source.list('repost')]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith('1', undefined);
    expect(posts.items.map((i) => i.id)).toEqual(['1']);
    expect(replies.items.map((i) => i.id)).toEqual(['2']);
    expect(reposts.items.map((i) => i.id)).toEqual(['3']);
    expect(posts.hasMore).toBe(true);
  });

  it('scopes kind-specific warnings to that kind', async () => {
    const fetchPage = vi.fn<(id: string, token?: string) => Promise<XTimelineResponse>>().mockResolvedValue({
      data: [post('1'), post('2', { text: 'RT @x: hi', referenced_tweets: [{ type: 'retweeted', id: '8' }] })],
      meta: {},
    });
    const source = createLiveContentSource(account, fetchPage);
    expect((await source.list('post')).warnings).toEqual([]);
    expect((await source.list('repost')).warnings).toHaveLength(1);
  });

  it('paginates with next_token, de-duplicates overlap, and stops when no token is returned', async () => {
    const fetchPage = vi
      .fn<(id: string, token?: string) => Promise<XTimelineResponse>>()
      .mockResolvedValueOnce({ data: [post('1'), post('2')], meta: { next_token: 'p2' } })
      .mockResolvedValueOnce({ data: [post('2'), post('3')], meta: {} });
    const source = createLiveContentSource(account, fetchPage);
    await source.list('post');
    const more = await source.loadMore('post');
    expect(fetchPage).toHaveBeenLastCalledWith('1', 'p2');
    expect(more.items.map((i) => i.id)).toEqual(['1', '2', '3']);
    expect(more.hasMore).toBe(false);
    await source.loadMore('post');
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('surfaces errors and allows retrying the same page', async () => {
    const fetchPage = vi
      .fn<(id: string, token?: string) => Promise<XTimelineResponse>>()
      .mockRejectedValueOnce(new XError('rate_limited', 'Rate limited'))
      .mockResolvedValueOnce({ data: [post('1')], meta: {} });
    const source = createLiveContentSource(account, fetchPage);
    await expect(source.list('post')).rejects.toMatchObject({ code: 'rate_limited' });
    expect((await source.list('post')).items).toHaveLength(1);
  });

  it('reset() discards the cache so the next list() refetches from the start', async () => {
    const fetchPage = vi.fn<(id: string, token?: string) => Promise<XTimelineResponse>>().mockResolvedValue({ data: [post('1')], meta: {} });
    const source = createLiveContentSource(account, fetchPage);
    await source.list('post');
    source.reset();
    await source.list('post');
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenLastCalledWith('1', undefined);
  });
});
