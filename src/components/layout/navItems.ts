import type { IconName } from '../ui/Icon';
import { ROUTES, type RouteId } from '../../dashboard/routes';

const ICONS: Record<RouteId, IconName> = {
  overview: 'dashboard',
  posts: 'post',
  reposts: 'repost',
  replies: 'reply',
  settings: 'settings',
};

export const NAV_ITEMS = ROUTES.map((r) => ({ ...r, icon: ICONS[r.id] }));
