import { routeHref, type RouteId } from '../../dashboard/routes';
import type { XAccount } from '../../services/x/session';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';

interface SidebarProps {
  current: RouteId;
  connectedAccount: XAccount | null;
  live: boolean;
}

export function Sidebar({ current, connectedAccount, live }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex-1 px-3 py-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.id === current;
            return (
              <li key={item.id}>
                <a
                  href={routeHref(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon name={item.icon} size={17} className={active ? 'text-brand-600' : 'text-slate-400'} />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            className={cn('h-2 w-2 shrink-0 rounded-full', connectedAccount ? 'bg-emerald-500' : 'bg-slate-300')}
            aria-hidden="true"
          />
          <span className="truncate">
            {connectedAccount ? `@${connectedAccount.username}` : 'No account connected'}
          </span>
        </div>
        <p className="mt-1 pl-4 text-xs text-slate-400">{live ? 'Showing live data' : 'Showing sample data'}</p>
      </div>
    </aside>
  );
}
