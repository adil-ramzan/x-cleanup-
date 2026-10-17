import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PREFERENCES, type Preferences } from '../types/settings';
import { loadPreferences, savePreferences, subscribeToPreferences } from '../services/preferencesStorage';

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  useEffect(() => {
    let cancelled = false;
    loadPreferences()
      .then((p) => !cancelled && setPrefs(p))
      .finally(() => !cancelled && setLoaded(true));
    const unsubscribe = subscribeToPreferences(setPrefs);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const update = useCallback(async (patch: Partial<Preferences>) => {
    const next = { ...prefsRef.current, ...patch };
    prefsRef.current = next;
    setPrefs(next);
    await savePreferences(next);
  }, []);

  return { prefs, loaded, update };
}
