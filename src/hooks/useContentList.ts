import { useCallback, useEffect, useState } from 'react';
import type { ContentItemOf, ContentKind } from '../types/content';
import type { ContentSnapshot } from '../services/contentSource';
import { useActiveContentSource } from '../dashboard/contentSourceContext';
import { isXError, needsReconnect } from '../services/x/errors';

export interface LoadError {
  message: string;
  /** The session ended; the user must reconnect in Settings. */
  reconnect: boolean;
}

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: LoadError }
  | { status: 'ready'; items: T[]; hasMore: boolean; warnings: string[] };

function toLoadError(err: unknown): LoadError {
  if (isXError(err)) return { message: err.message, reconnect: needsReconnect(err) };
  return { message: err instanceof Error ? err.message : 'Something went wrong.', reconnect: false };
}

export function useContentList<K extends ContentKind>(kind: K) {
  const { source } = useActiveContentSource();
  const [state, setState] = useState<LoadState<ContentItemOf<K>>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<LoadError | null>(null);

  const apply = useCallback(
    (snap: ContentSnapshot<K>) =>
      setState({ status: 'ready', items: snap.items, hasMore: snap.hasMore, warnings: snap.warnings }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    setLoadMoreError(null);
    source.list(kind).then(
      (snap) => !cancelled && apply(snap),
      (err: unknown) => !cancelled && setState({ status: 'error', error: toLoadError(err) }),
    );
    return () => {
      cancelled = true;
    };
  }, [source, kind, attempt, apply]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  /** Clears cached records and fetches again from the source. */
  const refresh = useCallback(() => {
    source.reset();
    setAttempt((n) => n + 1);
  }, [source]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      apply(await source.loadMore(kind));
    } catch (err) {
      setLoadMoreError(toLoadError(err));
    } finally {
      setLoadingMore(false);
    }
  }, [source, kind, apply]);

  return { state, retry, refresh, loadMore, loadingMore, loadMoreError };
}
