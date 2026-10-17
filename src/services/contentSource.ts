import type { ContentItemOf, ContentKind } from '../types/content';
import { MOCK_POSTS, MOCK_REPLIES, MOCK_REPOSTS } from '../mock';

export type ContentMode = 'mock' | 'live';

export interface ContentSnapshot<K extends ContentKind> {
  items: ContentItemOf<K>[];
  /** More (older) records can be requested with loadMore(). */
  hasMore: boolean;
  /** Notes about incomplete or skipped records from the source. */
  warnings: string[];
}

/**
 * Read-only access to an account's content. Pages depend on this interface,
 * not on a concrete source, so sample and live data are interchangeable.
 */
export interface ContentSource {
  readonly mode: ContentMode;
  /** Returns what's loaded so far, fetching the first page if nothing is loaded yet. */
  list<K extends ContentKind>(kind: K): Promise<ContentSnapshot<K>>;
  /** Fetches the next page of older records and returns the updated snapshot. */
  loadMore<K extends ContentKind>(kind: K): Promise<ContentSnapshot<K>>;
  /** Discards cached records so the next list() fetches fresh data. */
  reset(): void;
}

const MOCK_LATENCY_MS = 450;

const MOCK_DATA: { [K in ContentKind]: ContentItemOf<K>[] } = {
  post: MOCK_POSTS,
  repost: MOCK_REPOSTS,
  reply: MOCK_REPLIES,
};

function mockSnapshot<K extends ContentKind>(kind: K): Promise<ContentSnapshot<K>> {
  // Simulated latency so loading states are exercised in the UI.
  return new Promise((resolve) => {
    setTimeout(() => resolve({ items: [...MOCK_DATA[kind]], hasMore: false, warnings: [] }), MOCK_LATENCY_MS);
  });
}

export const mockContentSource: ContentSource = {
  mode: 'mock',
  list: mockSnapshot,
  loadMore: mockSnapshot,
  reset: () => {},
};
