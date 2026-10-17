import { X_AUTHORIZE_URL, X_API_BASE, X_REVOKE_URL, X_SCOPES, X_TOKEN_URL, TOKEN_REFRESH_MARGIN_MS } from './config';
import { XError } from './errors';
import { describeErrorBody, errorFromResponse, readJson, safeFetch } from './http';
import { createCodeChallenge, createCodeVerifier, randomToken } from './pkce';
import { clearSession, readSession, readStatus, writeSession, type XAccount, type XSession } from './session';

/**
 * OAuth 2.0 Authorization Code flow with PKCE for a *public* client
 * (X developer app type "Native App"). Public clients authenticate with their
 * client ID only, so no client secret exists in or is needed by the extension.
 */

const EXPIRED_NOTICE = 'Your X session expired or access was revoked. Reconnect to continue.';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

/** Redirect URI to register in the X developer app: https://<extension-id>.chromiumapp.org/ */
export function getRedirectUri(): string | null {
  return typeof chrome !== 'undefined' && chrome.identity?.getRedirectURL ? chrome.identity.getRedirectURL() : null;
}

async function postForm(url: string, params: Record<string, string>): Promise<Response> {
  return safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
}

function parseTokenResponse(body: unknown): TokenResponse | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Partial<TokenResponse>;
  return typeof b.access_token === 'string' && b.access_token ? (b as TokenResponse) : null;
}

const expiresAtFrom = (t: TokenResponse): number => Date.now() + (t.expires_in ?? 7200) * 1000;

type MeBody = { data?: { id?: string; username?: string; name?: string; profile_image_url?: string } } | null;

function parseMe(body: unknown): XAccount {
  const d = (body as MeBody)?.data;
  if (!d?.id || !d.username) throw new XError('api', 'X returned an incomplete account profile.');
  return { id: d.id, username: d.username, name: d.name ?? d.username, profileImageUrl: d.profile_image_url };
}

async function fetchMe(accessToken: string): Promise<XAccount> {
  const res = await safeFetch(`${X_API_BASE}/2/users/me?user.fields=profile_image_url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await readJson(res);
  if (!res.ok) throw errorFromResponse(res, body);
  return parseMe(body);
}

function isCancellation(message: string): boolean {
  return /did not approve|cancel|closed|user interaction required/i.test(message);
}

/** Opens X's consent screen, exchanges the code, and stores the session. */
export async function connect(): Promise<XAccount> {
  const { clientId } = await readStatus();
  if (!clientId) throw new XError('not_configured', 'Add your X app’s client ID before connecting.');
  const redirectUri = getRedirectUri();
  if (!redirectUri || !chrome.identity?.launchWebAuthFlow) {
    throw new XError('auth_failed', 'Account connection requires the installed extension (chrome.identity is unavailable).');
  }

  const verifier = createCodeVerifier();
  const state = randomToken(16);
  const authUrl = new URL(X_AUTHORIZE_URL);
  authUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: X_SCOPES.join(' '),
    state,
    code_challenge: await createCodeChallenge(verifier),
    code_challenge_method: 'S256',
  }).toString();

  let responseUrl: string | undefined;
  try {
    responseUrl = await chrome.identity.launchWebAuthFlow({ url: authUrl.toString(), interactive: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (isCancellation(message)) throw new XError('auth_cancelled', 'Connection was cancelled.');
    throw new XError(
      'auth_failed',
      'The X sign-in window couldn’t complete. Check that the client ID is correct and the redirect URI is registered in your X app.',
    );
  }
  if (!responseUrl) throw new XError('auth_cancelled', 'Connection was cancelled.');

  const params = new URL(responseUrl).searchParams;
  const error = params.get('error');
  if (error === 'access_denied') throw new XError('auth_cancelled', 'You declined access on X.');
  if (error) {
    throw new XError('auth_failed', `X didn’t authorize the connection (${params.get('error_description') ?? error}).`);
  }
  if (params.get('state') !== state) throw new XError('auth_failed', 'The sign-in response didn’t match this request. Please try again.');
  const code = params.get('code');
  if (!code) throw new XError('auth_failed', 'X didn’t return an authorization code.');

  // Authorization codes expire 30 seconds after issue: exchange immediately.
  const res = await postForm(X_TOKEN_URL, {
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });
  const body = await readJson(res);
  const token = res.ok ? parseTokenResponse(body) : null;
  if (!token) {
    const detail = describeErrorBody(body);
    throw new XError('auth_failed', `Couldn’t complete sign-in with X${detail ? `: ${detail}` : '.'}`, { status: res.status });
  }

  const user = await fetchMe(token.access_token);
  await writeSession({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: expiresAtFrom(token),
    scope: token.scope ?? X_SCOPES.join(' '),
    user,
    connectedAt: new Date().toISOString(),
  });
  return user;
}

let refreshInFlight: Promise<XSession> | null = null;

/** Exchanges the refresh token for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<XSession> {
  refreshInFlight ??= (async () => {
    try {
      const session = await readSession();
      if (!session) throw new XError('not_connected', 'No X account is connected.');
      const { clientId } = await readStatus();
      if (!session.refreshToken || !clientId) {
        await clearSession(EXPIRED_NOTICE);
        throw new XError('auth_expired', EXPIRED_NOTICE);
      }
      const res = await postForm(X_TOKEN_URL, {
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
        client_id: clientId,
      });
      const body = await readJson(res);
      const token = res.ok ? parseTokenResponse(body) : null;
      if (!token) {
        if (res.status === 400 || res.status === 401) {
          // invalid_grant: refresh token expired, already used, or access revoked by the user.
          await clearSession(EXPIRED_NOTICE);
          throw new XError('auth_expired', EXPIRED_NOTICE, { status: res.status });
        }
        throw errorFromResponse(res, body);
      }
      const next: XSession = {
        ...session,
        accessToken: token.access_token,
        // X may rotate refresh tokens; keep the previous one only if none is returned.
        refreshToken: token.refresh_token ?? session.refreshToken,
        expiresAt: expiresAtFrom(token),
        scope: token.scope ?? session.scope,
      };
      await writeSession(next);
      return next;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Returns a valid access token, refreshing it first if it is about to expire. */
export async function getAccessToken(): Promise<string> {
  const session = await readSession();
  if (!session) throw new XError('not_connected', 'No X account is connected.');
  if (session.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()) return session.accessToken;
  return (await refreshSession()).accessToken;
}

/**
 * Authenticated GET against the X API. On 401 the token is refreshed once and
 * the request retried; a second 401 ends the session.
 */
export async function authorizedGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(path, X_API_BASE);
  url.search = new URLSearchParams(params).toString();
  const send = (token: string) => safeFetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });

  let res = await send(await getAccessToken());
  if (res.status === 401) res = await send((await refreshSession()).accessToken);
  const body = await readJson(res);
  if (res.status === 401) {
    await clearSession(EXPIRED_NOTICE);
    throw new XError('auth_expired', EXPIRED_NOTICE, { status: 401 });
  }
  if (!res.ok) throw errorFromResponse(res, body);
  return body;
}

/** Re-reads the account profile to confirm the session is still valid. */
export async function verifyConnection(): Promise<XAccount> {
  const user = parseMe(await authorizedGet('/2/users/me', { 'user.fields': 'profile_image_url' }));
  const session = await readSession();
  if (session) await writeSession({ ...session, user });
  return user;
}

/** Revokes tokens with X (best effort) and removes all local session data. */
export async function disconnect(): Promise<void> {
  const session = await readSession();
  const { clientId } = await readStatus();
  if (session && clientId) {
    const tokens = [session.refreshToken, session.accessToken].filter((t): t is string => !!t);
    await Promise.allSettled(tokens.map((token) => postForm(X_REVOKE_URL, { token, client_id: clientId })));
  }
  await clearSession();
}
