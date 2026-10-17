import { ContentManager, type ContentManagerConfig } from '../components/content/ContentManager';
import { DateCell } from '../components/content/DateCell';
import { EngagementSummary } from '../components/content/EngagementSummary';
import { ViewOnXLink } from '../components/content/ViewOnXLink';
import type { Preferences } from '../types/settings';
import { formatDate } from '../utils/format';

const config: ContentManagerConfig<'reply'> = {
  kind: 'reply',
  title: 'Replies',
  description: 'Review replies you’ve written on other accounts’ posts.',
  noun: { singular: 'reply', plural: 'replies' },
  searchPlaceholder: 'Search reply text or account…',
  bulkActionLabel: 'Delete selected',
  rowLabel: (item) =>
    `Select reply${item.inReplyTo ? ` to @${item.inReplyTo.handle}` : ''} from ${formatDate(item.createdAt)}`,
  columns: [
    {
      id: 'content',
      header: 'Reply',
      className: 'min-w-[16rem]',
      render: (item) => (
        <div>
          <p className="text-xs text-slate-500">
            {item.inReplyTo ? (
              <>
                Replying to <span className="font-medium text-slate-700">@{item.inReplyTo.handle}</span>
              </>
            ) : (
              'Reply (replied-to account unavailable)'
            )}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{item.text}</p>
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
    { id: 'date', header: 'Replied', className: 'hidden w-36 sm:table-cell', render: (item) => <DateCell iso={item.createdAt} /> },
    {
      id: 'engagement',
      header: 'Engagement',
      className: 'hidden w-56 lg:table-cell',
      render: (item) => <EngagementSummary engagement={item.engagement} />,
    },
  ],
};

export function RepliesPage({ prefs }: { prefs: Preferences }) {
  return <ContentManager config={config} prefs={prefs} />;
}
