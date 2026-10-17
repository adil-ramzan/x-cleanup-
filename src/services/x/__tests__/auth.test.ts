import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authorizedGet, disconnect, getAccessToken } from '../auth';
import { createCodeChallenge } from '../pkce';
import { errorFromResponse } from '../http';
import type { XSession } from '../session';

const ACCESS = 'access-token-SECRET-1';
const REFRESH = 'refresh-token-SECRET-1';

function installChrome(initial: Record<string, unknown>) {
  const store: Record<string, unknown> = { ...initial };
  const keys = (k: string | string[]) => (Array.isArray(k) ? k : [k]);
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (k: string | string[]) => Object.fromEntries(keys(k).filter((x) => x in store).map((x) => [x, store[x]])),
        set: async (obj: Record<string, unknown>) => void Object.assign(store, obj),
        remove: async (k: string | string[]) => keys(k).forEach((x) => delete store[x]),
      },
      onChanged: { addListener() {}, removeListener() {} },
    },
  });
  return store;
}

const session = (overrides: Partial<XSession> = {}): XSession => ({
  accessToken: ACCESS,
  refreshToken: REFRESH,
  expiresAt: Date.now() + 3_600_000,
  scope: 'tweet.read users.read offline.access',
  user: { id: '1', username: 'me', name: 'Me' },
  connectedAt: '2026-10-17T00:00:00Z',
  ...overrides,
});

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

const allMessages = (e: unknown) => JSON.stringify(e, Object.getOwnPropertyNames(e as object));

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.unstubAllGlobals());

describe('PKCE', () => {
  it('matches the RFC 7636 S256 test vector', async () => {
    expect(await createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });
});

describe('errorFromResponse', () => {
  it('maps 429 to rate_limited with the reset time', () => {
    const e = errorFromResponse(new Response(null, { status: 429, headers: { 'x-rate-limit-reset': '1800000000' } }), null);
    expect(e).toMatchObject({ code: 'rate_limited', retryAt: 1_800_000_000_000 });
  });

  it('maps 402/403 to forbidden and includes X’s explanation', () => {
    const e = errorFromResponse(new Response(null, { status: 403 }), { title: 'Forbidden', detail: 'Client not enrolled' });
    expect(e.code).toBe('forbidden');
    expect(e.message).toContain('Client not enrolled');
  });

  it('maps 5xx to a generic retryable api error', () => {
    expect(errorFromResponse(new Response(null, { status: 503 }), null).message).toMatch(/HTTP 503/);
  });
});

describe('authorizedGet', () => {
  it('sends the bearer token and returns the parsed body', async () => {
    installChrome({ xSession: session(), xClientId: 'client-1' });
    const fetchMock = vi.fn().mockResolvedValue(json(200, { data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(authorizedGet('/2/users/1/tweets', { max_results: '100' })).resolves.toEqual({ data: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.x.com/2/users/1/tweets?max_results=100');
    expect(init.headers.Authorization).toBe(`Bearer ${ACCESS}`);
  });

  it('refreshes once on 401, stores rotated tokens, and retries', async () => {
    const store = installChrome({ xSession: session(), xClientId: 'client-1' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(401, { title: 'Unauthorized' }))
      .mockResolvedValueOnce(json(200, { access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 7200 }))
      .mockResolvedValueOnce(json(200, { data: [{ id: '1' }] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(authorizedGet('/2/users/me')).resolves.toEqual({ data: [{ id: '1' }] });
    const refreshBody = new URLSearchParams(fetchMock.mock.calls[1][1].body);
    expect(Object.fromEntries(refreshBody)).toEqual({ grant_type: 'refresh_token', refresh_token: REFRESH, client_id: 'client-1' });
    expect(fetchMock.mock.calls[1][1].headers).not.toHaveProperty('Authorization'); // public client: no secret
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer new-access');
    expect(store.xSession).toMatchObject({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  it('refreshes proactively when the access token is about to expire', async () => {
    installChrome({ xSession: session({ expiresAt: Date.now() + 1000 }), xClientId: 'client-1' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(200, { access_token: 'fresh', expires_in: 7200 })));
    expect(await getAccessToken()).toBe('fresh');
  });

  it('ends the session with a notice when the refresh token is revoked, without leaking tokens', async () => {
    const store = installChrome({ xSession: session({ expiresAt: 0 }), xClientId: 'client-1' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(400, { error: 'invalid_request', error_description: 'Value passed for the token was invalid.' })));
    const err = await authorizedGet('/2/users/me').catch((e: unknown) => e);
    expect(err).toMatchObject({ code: 'auth_expired' });
    expect(store.xSession).toBeUndefined();
    expect(store.xNotice).toMatch(/expired or access was revoked/);
    expect(allMessages(err)).not.toContain(ACCESS);
    expect(allMessages(err)).not.toContain(REFRESH);
  });

  it('reports network failures without clearing the session', async () => {
    const store = installChrome({ xSession: session(), xClientId: 'client-1' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(authorizedGet('/2/users/me')).rejects.toMatchObject({ code: 'network' });
    expect(store.xSession).toBeDefined();
  });

  it('throws not_connected when there is no session', async () => {
    installChrome({});
    await expect(authorizedGet('/2/users/me')).rejects.toMatchObject({ code: 'not_connected' });
  });
});

describe('disconnect', () => {
  it('revokes both tokens as a public client and clears local session data', async () => {
    const store = installChrome({ xSession: session(), xClientId: 'client-1', xNotice: 'old' });
    const fetchMock = vi.fn().mockResolvedValue(json(200, { revoked: true }));
    vi.stubGlobal('fetch', fetchMock);
    await disconnect();
    const bodies = fetchMock.mock.calls.map(([url, init]) => [url, Object.fromEntries(new URLSearchParams(init.body))]);
    expect(bodies).toEqual([
      ['https://api.x.com/2/oauth2/revoke', { token: REFRESH, client_id: 'client-1' }],
      ['https://api.x.com/2/oauth2/revoke', { token: ACCESS, client_id: 'client-1' }],
    ]);
    expect(store.xSession).toBeUndefined();
    expect(store.xNotice).toBeUndefined();
    expect(store.xClientId).toBe('client-1');
  });

  it('still clears local data when revocation fails', async () => {
    const store = installChrome({ xSession: session(), xClientId: 'client-1' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await disconnect();
    expect(store.xSession).toBeUndefined();
  });
});
