import { ContentManager, type ContentManagerConfig } from '../components/content/ContentManager';
import { DateCell } from '../components/content/DateCell';
import { ViewOnXLink } from '../components/content/ViewOnXLink';
import type { Preferences } from '../types/settings';
import { formatDate } from '../utils/format';

const config: ContentManagerConfig<'repost'> = {
  kind: 'repost',
  title: 'Reposts',
  description: 'Review posts you’ve reposted from other accounts.',
  noun: { singular: 'repost', plural: 'reposts' },
  searchPlaceholder: 'Search text or original author…',
  bulkActionLabel: 'Undo selected reposts',
  rowLabel: (item) =>
    `Select repost${item.original.author ? ` of @${item.original.author.handle}` : ''} from ${formatDate(item.createdAt)}`,
  columns: [
    {
      id: 'content',
      header: 'Original post',
      className: 'min-w-[16rem]',
      render: (item) => (
        <div>
          <p className="text-xs text-slate-500">
            {item.original.author ? (
              <>
                {item.original.author.displayName !== item.original.author.handle && (
                  <span className="font-medium text-slate-700">{item.original.author.displayName} </span>
                )}
                @{item.original.author.handle}
              </>
            ) : (
              'Unknown author'
            )}
            {item.original.postedAt && <> · {formatDate(item.original.postedAt)}</>}
          </p>
          {item.original.text ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{item.original.text}</p>
          ) : (
            <p className="mt-1 text-sm italic text-slate-400">Original post unavailable</p>
          )}
          <div className="mt-1.5 sm:hidden">
            <span className="text-xs text-slate-500">Reposted {formatDate(item.createdAt)}</span>
          </div>
          <div className="mt-1.5 empty:hidden">
            <ViewOnXLink url={item.original.url} label="View original on X" />
          </div>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Reposted',
      className: 'hidden w-36 sm:table-cell',
      render: (item) => <DateCell iso={item.createdAt} />,
    },
  ],
};

export function RepostsPage({ prefs }: { prefs: Preferences }) {
  return <ContentManager config={config} prefs={prefs} />;
}
