import { routeHref, type RouteId } from '../../dashboard/routes';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';

/** Top bar with scrollable tab navigation, shown below the md breakpoint in place of the sidebar. */
export function MobileNav({ current }: { current: RouteId }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white md:hidden">
      <div className="flex h-14 items-center px-4">
        <Logo />
      </div>
      <nav aria-label="Main" className="overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.id === current;
            return (
              <li key={item.id}>
                <a
                  href={routeHref(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium',
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
