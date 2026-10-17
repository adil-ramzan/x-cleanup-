import { DEFAULT_PREFERENCES, type Preferences } from '../types/settings';

const STORAGE_KEY = 'preferences';

/** chrome.storage is only present when running as an extension (not under `vite dev`). */
function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

function sanitize(value: unknown): Preferences {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PREFERENCES };
  const v = value as Partial<Record<keyof Preferences, unknown>>;
  const ranges: Preferences['defaultDateRange'][] = ['all', '7d', '30d', '90d', '365d'];
  return {
    defaultDateRange: ranges.includes(v.defaultDateRange as Preferences['defaultDateRange'])
      ? (v.defaultDateRange as Preferences['defaultDateRange'])
      : DEFAULT_PREFERENCES.defaultDateRange,
    rowDensity:
      v.rowDensity === 'compact' || v.rowDensity === 'comfortable' ? v.rowDensity : DEFAULT_PREFERENCES.rowDensity,
    confirmBeforeBulkActions:
      typeof v.confirmBeforeBulkActions === 'boolean'
        ? v.confirmBeforeBulkActions
        : DEFAULT_PREFERENCES.confirmBeforeBulkActions,
    useSampleData: typeof v.useSampleData === 'boolean' ? v.useSampleData : DEFAULT_PREFERENCES.useSampleData,
  };
}

export async function loadPreferences(): Promise<Preferences> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return sanitize(result[STORAGE_KEY]);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return sanitize(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: prefs });
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Notifies when preferences change in another extension page (e.g. popup ↔ dashboard). */
export function subscribeToPreferences(onChange: (prefs: Preferences) => void): () => void {
  if (!hasChromeStorage()) return () => {};
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'local' && STORAGE_KEY in changes) onChange(sanitize(changes[STORAGE_KEY].newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
