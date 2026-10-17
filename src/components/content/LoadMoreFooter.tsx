import type { LoadError } from '../../hooks/useContentList';
import { pluralize } from '../../utils/format';
import { Button } from '../ui/Button';
import { ReconnectLink } from './ReconnectLink';

interface LoadMoreFooterProps {
  hasMore: boolean;
  loadingMore: boolean;
  error: LoadError | null;
  loadedCount: number;
  noun: { singular: string; plural: string };
  onLoadMore: () => void;
}

/** Pagination controls for live data. Older records are fetched only on request. */
export function LoadMoreFooter({ hasMore, loadingMore, error, loadedCount, noun, onLoadMore }: LoadMoreFooterProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-slate-200 px-4 py-4 text-center">
      <p className="text-xs text-slate-500" aria-live="polite">
        {pluralize(loadedCount, noun.singular, noun.plural)} loaded from X.{' '}
        {hasMore
          ? 'Search and date filters apply to loaded records only.'
          : 'You’ve reached the end of what X provides (your 3,200 most recent posts, replies, and reposts combined).'}
      </p>
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2 text-sm text-red-600">
          <p className="max-w-md">{error.message}</p>
          {error.reconnect && <ReconnectLink />}
        </div>
      )}
      {hasMore && !error?.reconnect && (
        <Button onClick={onLoadMore} disabled={loadingMore} aria-busy={loadingMore}>
          {loadingMore ? 'Loading older records…' : error ? 'Try again' : 'Load older from X'}
        </Button>
      )}
    </div>
  );
}
