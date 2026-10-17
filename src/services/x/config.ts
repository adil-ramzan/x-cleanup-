/** Official X API v2 endpoints and the minimum OAuth 2.0 scopes this extension needs. */
export const X_AUTHORIZE_URL = 'https://x.com/i/oauth2/authorize';
export const X_API_BASE = 'https://api.x.com';
export const X_TOKEN_URL = `${X_API_BASE}/2/oauth2/token`;
export const X_REVOKE_URL = `${X_API_BASE}/2/oauth2/revoke`;

/**
 * Read-only scopes:
 * - tweet.read / users.read: required by GET /2/users/me and GET /2/users/:id/tweets
 * - offline.access: issues a refresh token so the user stays connected beyond the 2-hour access-token lifetime
 */
export const X_SCOPES = ['tweet.read', 'users.read', 'offline.access'] as const;

/** Page size for the user posts timeline (API allows 5–100). */
export const TIMELINE_PAGE_SIZE = 100;

/** Refresh the access token this long before it expires. */
export const TOKEN_REFRESH_MARGIN_MS = 60_000;

export const BUILD_TIME_CLIENT_ID = (import.meta.env.VITE_X_CLIENT_ID ?? '').trim();

export const xPostUrl = (username: string, id: string): string => `https://x.com/${username}/status/${id}`;
