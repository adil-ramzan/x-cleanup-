import type { ContentItem, ContentItemOf, ContentKind } from '../types/content';
import type { ContentSnapshot, ContentSource } from './contentSource';
import type { XTimelineResponse } from './x/apiTypes';
import { normalizeTimelinePage, type SourceWarning } from './x/normalize';
import type { XAccount } from './x/session';
import { fetchTimelinePage } from './x/timeline';

type FetchPage = (userId: string, paginationToken?: string) => Promise<XTimelineResponse>;

/**
 * Content source backed by the connected account's X timeline.
 *
 * Posts, replies, and reposts all come from one endpoint, so a single shared
 * cache serves every page: navigating between pages never re-requests data
 * (each request consumes the developer app's API credits). Older records are
 * fetched only when the user asks for more.
 */
export function createLiveContentSource(account: XAccount, fetchPage: FetchPage = fetchTimelinePage): ContentSource {
  let items: ContentItem[] = [];
  const seen = new Set<string>();
  let warnings: SourceWarning[] = [];
  let nextToken: string | undefined;
  let started = false;
  let exhausted = false;
  let inFlight: Promise<void> | null = null;

  const snapshot = <K extends ContentKind>(kind: K): ContentSnapshot<K> => ({
    items: items.filter((i): i is ContentItemOf<K> => i.kind === kind),
    hasMore: !exhausted,
    warnings: warnings.filter((w) => !w.kind || w.kind === kind).map((w) => w.text),
  });

  function fetchNext(): Promise<void> {
    inFlight ??= (async () => {
      try {
        const body = await fetchPage(account.id, nextToken);
        const page = normalizeTimelinePage(body, account);
        for (const item of page.items) {
          if (seen.has(item.id)) continue; // pages can overlap if new posts arrive mid-pagination
          seen.add(item.id);
          items.push(item);
        }
        warnings = [...warnings, ...page.warnings];
        nextToken = body?.meta?.next_token;
        exhausted = !nextToken;
        started = true;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  return {
    mode: 'live',
    async list(kind) {
      if (inFlight) await inFlight;
      if (!started) await fetchNext();
      return snapshot(kind);
    },
    async loadMore(kind) {
      if (inFlight) await inFlight;
      else if (!started || !exhausted) await fetchNext();
      return snapshot(kind);
    },
    reset() {
      items = [];
      seen.clear();
      warnings = [];
      nextToken = undefined;
      started = false;
      exhausted = false;
    },
  };
}
