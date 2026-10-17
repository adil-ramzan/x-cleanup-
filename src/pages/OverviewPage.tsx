import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Icon, type IconName } from '../components/ui/Icon';
import { DataModeBadge, DataModeNotice } from '../components/ui/DataModeNotice';
import { Skeleton } from '../components/ui/Skeleton';
import { useActiveContentSource } from '../dashboard/contentSourceContext';
import { routeHref, type RouteId } from '../dashboard/routes';
import { useContentList, type LoadState } from '../hooks/useContentList';
import type { ContentItem } from '../types/content';
import { dateRangeBounds, emptyDateRange } from '../utils/filters';
import { formatDate } from '../utils/format';

function countSince(items: ContentItem[], days: '30d'): number {
  const { start } = dateRangeBounds(emptyDateRange(days));
  return items.filter((i) => start === null || new Date(i.createdAt).getTime() >= start).length;
}

interface StatCardProps {
  label: string;
  icon: IconName;
  route: RouteId;
  state: LoadState<ContentItem>;
  onRetry: () => void;
}

function StatCard({ label, icon, route, state, onRetry }: StatCardProps) {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">{label}</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="mt-3 min-h-[3.5rem]">
        {state.status === 'loading' && (
          <div role="status" aria-label={`Loading ${label.toLowerCase()}`} className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        )}
        {state.status === 'error' && (
          <div className="text-sm text-red-600">
            Couldn’t load.{' '}
            {state.error.reconnect ? (
              <a href={routeHref('settings')} className="font-medium underline underline-offset-2">
                Reconnect
              </a>
            ) : (
              <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
                Retry
              </button>
            )}
          </div>
        )}
        {state.status === 'ready' && (
          <>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {state.items.length.toLocaleString()}
              {state.hasMore && <span className="ml-1 text-base font-medium text-slate-400">+</span>}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {countSince(state.items, '30d')} in the last 30 days
              {state.hasMore && ' · more on X not yet loaded'}
            </p>
          </>
        )}
      </div>
      <a
        href={routeHref(route)}
        className="mt-4 inline-flex items-center gap-1 self-start rounded text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Manage {label.toLowerCase()} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

function describe(item: ContentItem): { label: string; text: string; icon: IconName } {
  switch (item.kind) {
    case 'post':
      return { label: 'Posted', text: item.text, icon: 'post' };
    case 'repost':
      return {
        label: item.original.author ? `Reposted @${item.original.author.handle}` : 'Reposted',
        text: item.original.text ?? 'Original post unavailable',
        icon: 'repost',
      };
    case 'reply':
      return { label: item.inReplyTo ? `Replied to @${item.inReplyTo.handle}` : 'Replied', text: item.text, icon: 'reply' };
  }
}

export function OverviewPage() {
  const { account } = useActiveContentSource();
  const posts = useContentList('post');
  const reposts = useContentList('repost');
  const replies = useContentList('reply');
  const lists = [posts, reposts, replies];
  const allReady = lists.every((l) => l.state.status === 'ready');
  const anyError = lists.some((l) => l.state.status === 'error');

  const recent = lists
    .flatMap<ContentItem>((l) => (l.state.status === 'ready' ? l.state.items : []))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of the content X Cleanup can help you manage."
        actions={allReady && <DataModeBadge />}
      />
      <div className="mb-6">
        <DataModeNotice />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Posts" icon="post" route="posts" state={posts.state} onRetry={posts.retry} />
        <StatCard label="Reposts" icon="repost" route="reposts" state={reposts.state} onRetry={reposts.retry} />
        <StatCard label="Replies" icon="reply" route="replies" state={replies.state} onRetry={replies.retry} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="recent-heading" className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 id="recent-heading" className="text-sm font-semibold text-slate-900">
              Recent activity
            </h2>
            {allReady && <DataModeBadge />}
          </div>
          {anyError ? (
            <ErrorState
              message={
                lists.map((l) => (l.state.status === 'error' ? l.state.error.message : null)).find(Boolean) ??
                'Some data couldn’t be loaded.'
              }
              onRetry={() => lists.forEach((l) => l.retry())}
            />
          ) : allReady && recent.length === 0 ? (
            <EmptyState title="No activity yet" description="No posts, reposts, or replies were returned." />
          ) : !allReady ? (
            <ul className="divide-y divide-slate-100" role="status" aria-label="Loading recent activity">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="flex gap-3 px-5 py-4">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((item) => {
                const d = describe(item);
                return (
                  <li key={item.id} className="flex gap-3 px-5 py-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Icon name={d.icon} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">
                        {d.label} · <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                      </p>
                      <p className="mt-0.5 truncate text-sm text-slate-800">{d.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="account-heading" className="card p-5">
          <h2 id="account-heading" className="text-sm font-semibold text-slate-900">
            X account
          </h2>
          {account ? (
            <>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>
                  Connected as <span className="font-medium">@{account.username}</span>
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Counts reflect records loaded from X so far. Load older records from the Posts, Reposts, or Replies
                pages.
              </p>
            </>
          ) : (
            <>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden="true" />
                Showing sample data
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Counts and activity above come from built-in sample data. Connect an X account in Settings to see your
                own records.
              </p>
            </>
          )}
          <a
            href={routeHref('settings')}
            className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Account settings <span aria-hidden="true">→</span>
          </a>
        </section>
      </div>
    </>
  );
}
