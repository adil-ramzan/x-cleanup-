import { ContentManager, type ContentManagerConfig } from '../components/content/ContentManager';
import { DateCell } from '../components/content/DateCell';
import { EngagementSummary } from '../components/content/EngagementSummary';
import { ViewOnXLink } from '../components/content/ViewOnXLink';
import { Icon } from '../components/ui/Icon';
import type { Preferences } from '../types/settings';
import { formatDate } from '../utils/format';

const config: ContentManagerConfig<'post'> = {
  kind: 'post',
  title: 'Posts',
  description: 'Review the posts you’ve published and select the ones to clean up.',
  noun: { singular: 'post', plural: 'posts' },
  searchPlaceholder: 'Search post text…',
  bulkActionLabel: 'Delete selected',
  rowLabel: (item) => `Select post from ${formatDate(item.createdAt)}`,
  columns: [
    {
      id: 'content',
      header: 'Post',
      className: 'min-w-[16rem]',
      render: (item) => (
        <div>
          <p className="text-sm leading-relaxed text-slate-800">{item.text}</p>
          {item.hasMedia && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
              <Icon name="image" size={12} /> Includes media
            </span>
          )}
          <div className="mt-1.5 sm:hidden">
            <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
          </div>
          <div className="mt-1.5 lg:hidden">
            <EngagementSummary engagement={item.engagement} />
          </div>
          <div className="mt-1.5 empty:hidden">
            <ViewOnXLink url={item.url} />
          </div>
        </div>
      ),
    },
    { id: 'date', header: 'Posted', className: 'hidden w-36 sm:table-cell', render: (item) => <DateCell iso={item.createdAt} /> },
    {
      id: 'engagement',
      header: 'Engagement',
      className: 'hidden w-56 lg:table-cell',
      render: (item) => <EngagementSummary engagement={item.engagement} />,
    },
  ],
};

export function PostsPage({ prefs }: { prefs: Preferences }) {
  return <ContentManager config={config} prefs={prefs} />;
}
