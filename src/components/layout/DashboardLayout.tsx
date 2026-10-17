import type { ReactNode } from 'react';
import type { RouteId } from '../../dashboard/routes';
import type { XAccount } from '../../services/x/session';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  current: RouteId;
  connectedAccount: XAccount | null;
  live: boolean;
  children: ReactNode;
}

export function DashboardLayout({ current, connectedAccount, live, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only z-50 rounded-md bg-white px-3 py-2 shadow focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <Sidebar current={current} connectedAccount={connectedAccount} live={live} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav current={current} />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
