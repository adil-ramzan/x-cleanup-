export type RouteId = 'overview' | 'posts' | 'reposts' | 'replies' | 'settings';

export const ROUTES: { id: RouteId; label: string }[] = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'posts', label: 'Posts' },
  { id: 'reposts', label: 'Reposts' },
  { id: 'replies', label: 'Replies' },
  { id: 'settings', label: 'Settings' },
];

export const DEFAULT_ROUTE: RouteId = 'overview';

export function parseRoute(hash: string): RouteId {
  const id = hash.replace(/^#\/?/, '');
  return ROUTES.some((r) => r.id === id) ? (id as RouteId) : DEFAULT_ROUTE;
}

export const routeHref = (id: RouteId): string => `#/${id}`;
