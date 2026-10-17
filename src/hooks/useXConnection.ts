import { useCallback, useEffect, useState } from 'react';
import { readStatus, subscribeToStatus, type XConnectionStatus } from '../services/x/session';

/** Live view of the X connection status (client ID, connected account, notices). Contains no tokens. */
export function useXConnection() {
  const [status, setStatus] = useState<XConnectionStatus | null>(null);

  const reload = useCallback(() => {
    readStatus().then(setStatus, () =>
      setStatus({ clientId: '', clientIdSource: 'none', account: null, notice: null }),
    );
  }, []);

  useEffect(() => {
    reload();
    return subscribeToStatus(reload);
  }, [reload]);

  return { status, loaded: status !== null, reload };
}
