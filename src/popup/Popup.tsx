import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Icon, type IconName } from '../components/ui/Icon';
import type { RouteId } from '../dashboard/routes';
import { openDashboard } from '../services/extension';
import { useXConnection } from '../hooks/useXConnection';
import { usePreferences } from '../hooks/usePreferences';

const SHORTCUTS: { route: RouteId; label: string; icon: IconName }[] = [
  { route: 'posts', label: 'Posts', icon: 'post' },
  { route: 'reposts', label: 'Reposts', icon: 'repost' },
  { route: 'replies', label: 'Replies', icon: 'reply' },
];

export function Popup() {
  const { status } = useXConnection();
  const { prefs, loaded } = usePreferences();
  const account = status?.account ?? null;
  const statusText = !status || !loaded
    ? 'Checking connection…'
    : account
      ? `Connected as @${account.username} · ${prefs.useSampleData ? 'showing sample data' : 'live data'}`
      : 'No X account connected · sample data';

  return (
    <div className="w-[340px] bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <Logo />
        <button
          type="button"
          onClick={() => void openDashboard('settings')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Open settings"
          title="Settings"
        >
          <Icon name="settings" size={16} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${account ? 'bg-emerald-500' : 'bg-slate-300'}`}
            aria-hidden="true"
          />
          {statusText}
        </div>

        <Button variant="primary" className="w-full" onClick={() => void openDashboard()}>
          <Icon name="external" size={15} />
          Open dashboard
        </Button>

        <nav aria-label="Jump to">
          <ul className="grid grid-cols-3 gap-2">
            {SHORTCUTS.map((s) => (
              <li key={s.route}>
                <button
                  type="button"
                  onClick={() => void openDashboard(s.route)}
                  className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <Icon name={s.icon} size={16} className="text-brand-600" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
        X Cleanup only reads data from X. It doesn’t delete or change anything in this version.
      </footer>
    </div>
  );
}
