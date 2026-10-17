import { useMemo, useState } from 'react';
import type { ContentItemOf, ContentKind } from '../../types/content';
import type { ContentFilters } from '../../types/filters';
import type { Preferences } from '../../types/settings';
import { useActiveContentSource } from '../../dashboard/contentSourceContext';
import { useContentList } from '../../hooks/useContentList';
import { useSelection } from '../../hooks/useSelection';
import { emptyDateRange, filterItems, isCustomRangeInvalid } from '../../utils/filters';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { DataModeBadge, DataModeNotice } from '../ui/DataModeNotice';
import { DateRangeFilter } from '../ui/DateRangeFilter';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Icon } from '../ui/Icon';
import { SearchInput } from '../ui/SearchInput';
import { ContentTable, type Column } from './ContentTable';
import { LoadMoreFooter } from './LoadMoreFooter';
import { ReconnectLink } from './ReconnectLink';
import { SelectionBar } from './SelectionBar';
import { TableSkeleton } from './TableSkeleton';

export interface ContentManagerConfig<K extends ContentKind> {
  kind: K;
  title: string;
  description: string;
  noun: { singular: string; plural: string };
  searchPlaceholder: string;
  bulkActionLabel: string;
  columns: Column<ContentItemOf<K>>[];
  rowLabel: (item: ContentItemOf<K>) => string;
}

/** Shared list page for posts, reposts, and replies: load → filter → select. */
export function ContentManager<K extends ContentKind>({
  config,
  prefs,
}: {
  config: ContentManagerConfig<K>;
  prefs: Preferences;
}) {
  const { source } = useActiveContentSource();
  const live = source.mode === 'live';
  const { state, retry, refresh, loadMore, loadingMore, loadMoreError } = useContentList(config.kind);
  const initialFilters: ContentFilters = { query: '', dateRange: emptyDateRange(prefs.defaultDateRange) };
  const [filters, setFilters] = useState<ContentFilters>(initialFilters);

  const allItems = useMemo(() => (state.status === 'ready' ? state.items : []), [state]);
  const rangeInvalid = isCustomRangeInvalid(filters.dateRange);
  const visible = useMemo(
    () => (rangeInvalid ? [] : filterItems(allItems, filters)),
    [allItems, filters, rangeInvalid],
  );
  const selection = useSelection(useMemo(() => visible.map((i) => i.id), [visible]));
  const filtersActive = filters.query.trim() !== '' || filters.dateRange.preset !== 'all';
  const resetFilters = () => setFilters({ query: '', dateRange: emptyDateRange('all') });
  const hasMore = state.status === 'ready' && state.hasMore;

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          state.status !== 'loading' && (
            <>
              <DataModeBadge />
              {live && (
                <Button size="sm" variant="ghost" onClick={refresh} title="Fetch the latest records from X">
                  <Icon name="refresh" size={13} />
                  Refresh
                </Button>
              )}
            </>
          )
        }
      />
      <div className="mb-4">
        <DataModeNotice />
      </div>

      <section aria-label={`${config.title} list`} className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-start">
          <div className="lg:max-w-sm lg:flex-1">
            <SearchInput
              value={filters.query}
              onChange={(query) => setFilters((f) => ({ ...f, query }))}
              placeholder={config.searchPlaceholder}
              label={`Search ${config.noun.plural}`}
            />
          </div>
          <div className="flex flex-1 flex-wrap items-start gap-2 lg:justify-end">
            <DateRangeFilter
              value={filters.dateRange}
              onChange={(dateRange) => setFilters((f) => ({ ...f, dateRange }))}
            />
            {filtersActive && (
              <Button variant="ghost" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        </div>

        {state.status === 'loading' && <TableSkeleton />}

        {state.status === 'error' && (
          <ErrorState
            title={state.error.reconnect ? 'Reconnect your X account' : undefined}
            message={state.error.message}
            onRetry={retry}
            action={state.error.reconnect ? <ReconnectLink /> : undefined}
          />
        )}

        {state.status === 'ready' && state.warnings.length > 0 && (
          <ul role="note" className="space-y-1 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            {state.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <Icon name="alert" size={13} className="mt-px shrink-0 text-amber-600" />
                {w}
              </li>
            ))}
          </ul>
        )}

        {state.status === 'ready' && allItems.length === 0 && (
          <EmptyState
            title={live ? `No ${config.noun.plural} found` : `No ${config.noun.plural} yet`}
            description={
              live
                ? hasMore
                  ? `None of the records loaded so far are ${config.noun.plural}. Older records may contain some.`
                  : `X returned no ${config.noun.plural} for this account.`
                : `There are no ${config.noun.plural} to show.`
            }
          />
        )}

        {state.status === 'ready' && allItems.length > 0 && (
          <>
            <SelectionBar
              visibleCount={visible.length}
              totalCount={allItems.length}
              selectedCount={selection.count}
              noun={config.noun}
              actionLabel={config.bulkActionLabel}
              onClear={selection.clear}
            />
            {visible.length === 0 ? (
              <EmptyState
                icon="search"
                title={`No ${config.noun.plural} match your filters`}
                description={
                  live && hasMore
                    ? 'Try a different search term or widen the date range. Older records that aren’t loaded yet aren’t searched.'
                    : 'Try a different search term or widen the date range.'
                }
                action={<Button onClick={resetFilters}>Reset filters</Button>}
              />
            ) : (
              <ContentTable
                items={visible}
                columns={config.columns}
                selection={selection}
                rowLabel={config.rowLabel}
                selectAllLabel={`Select all ${visible.length} visible ${config.noun.plural}`}
                density={prefs.rowDensity}
              />
            )}
          </>
        )}

        {live && state.status === 'ready' && (
          <LoadMoreFooter
            hasMore={state.hasMore}
            loadingMore={loadingMore}
            error={loadMoreError}
            loadedCount={allItems.length}
            noun={config.noun}
            onLoadMore={() => void loadMore()}
          />
        )}
      </section>
    </>
  );
}
