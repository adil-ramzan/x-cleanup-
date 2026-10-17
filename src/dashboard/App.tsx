import { useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePreferences } from '../hooks/usePreferences';
import { useHashRoute } from '../hooks/useHashRoute';
import { useXConnection } from '../hooks/useXConnection';
import { OverviewPage } from '../pages/OverviewPage';
import { PostsPage } from '../pages/PostsPage';
import { RepliesPage } from '../pages/RepliesPage';
import { RepostsPage } from '../pages/RepostsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { mockContentSource } from '../services/contentSource';
import { createLiveContentSource } from '../services/liveContentSource';
import { ContentSourceContext, type ActiveContentSource } from './contentSourceContext';
import { ROUTES } from './routes';

export function App() {
  const route = useHashRoute();
  const { prefs, loaded: prefsLoaded, update } = usePreferences();
  const { status } = useXConnection();

  const connected = status?.account ?? null;
  const liveAccount = connected && !prefs.useSampleData ? connected : null;
  // One live source (and cache) per connected account; switching mode or account starts fresh.
  const active = useMemo<ActiveContentSource>(
    () =>
      liveAccount
        ? { source: createLiveContentSource(liveAccount), account: liveAccount }
        : { source: mockContentSource, account: null },
    // Recreate only when the identity changes, not when the profile object is re-read.
    [liveAccount?.id, liveAccount?.username],
  );

  useEffect(() => {
    const label = ROUTES.find((r) => r.id === route)?.label ?? 'Dashboard';
    document.title = `${label} · X Cleanup`;
    window.scrollTo(0, 0);
  }, [route]);

  const ready = prefsLoaded && status !== null;

  return (
    <ContentSourceContext.Provider value={active}>
      <DashboardLayout current={route} connectedAccount={connected} live={!!liveAccount}>
        {/* Wait for stored preferences and connection status so pages start with the right data source. */}
        {ready && (
          <>
            {route === 'overview' && <OverviewPage />}
            {route === 'posts' && <PostsPage prefs={prefs} />}
            {route === 'reposts' && <RepostsPage prefs={prefs} />}
            {route === 'replies' && <RepliesPage prefs={prefs} />}
            {route === 'settings' && <SettingsPage prefs={prefs} onChange={update} connection={status} />}
          </>
        )}
      </DashboardLayout>
    </ContentSourceContext.Provider>
  );
}
