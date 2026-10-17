import { useEffect, useState } from 'react';
import { parseRoute, type RouteId } from '../dashboard/routes';

/** Minimal hash router — enough for a handful of extension pages without a routing dependency. */
export function useHashRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
