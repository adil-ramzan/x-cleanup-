import type { RouteId } from '../dashboard/routes';

/** Opens (or focuses) the full-page dashboard in a tab. */
export async function openDashboard(route: RouteId = 'overview'): Promise<void> {
  const path = `dashboard.html#/${route}`;
  if (typeof chrome !== 'undefined' && chrome.tabs?.create && chrome.runtime?.getURL) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(path) });
    window.close();
    return;
  }
  // Fallback for `vite dev`, where extension APIs are unavailable.
  window.open(`/${path}`, '_blank', 'noopener');
}
