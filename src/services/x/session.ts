import { BUILD_TIME_CLIENT_ID } from './config';

/**
 * Persisted OAuth session. Stored in chrome.storage.local, which only this
 * extension's own pages can read (no content scripts are registered).
 * Never log this object.
 */
export interface XSession {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms. */
  expiresAt: number;
  scope: string;
  user: XAccount;
  connectedAt: string;
}

export interface XAccount {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

/** Non-secret status visible to the UI. */
export interface XConnectionStatus {
  clientId: string;
  /** Where the client ID came from. */
  clientIdSource: 'settings' | 'build' | 'none';
  account: XAccount | null;
  /** Reason the last session ended unexpectedly (e.g. revoked); cleared on reconnect. */
  notice: string | null;
}

const SESSION_KEY = 'xSession';
const CLIENT_ID_KEY = 'xClientId';
const NOTICE_KEY = 'xNotice';

function storage(): chrome.storage.LocalStorageArea {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    throw new Error('X account connection is only available when running as an installed extension.');
  }
  return chrome.storage.local;
}

export const hasExtensionStorage = (): boolean => typeof chrome !== 'undefined' && !!chrome.storage?.local;

export async function readSession(): Promise<XSession | null> {
  if (!hasExtensionStorage()) return null;
  const r = await storage().get(SESSION_KEY);
  const s = r[SESSION_KEY] as Partial<XSession> | undefined;
  if (!s || typeof s.accessToken !== 'string' || typeof s.expiresAt !== 'number' || !s.user?.id) return null;
  return s as XSession;
}

export async function writeSession(session: XSession): Promise<void> {
  await storage().set({ [SESSION_KEY]: session });
  await storage().remove(NOTICE_KEY);
}

/** Removes all session data. An optional notice explains why to the user. */
export async function clearSession(notice?: string): Promise<void> {
  await storage().remove(SESSION_KEY);
  if (notice) await storage().set({ [NOTICE_KEY]: notice });
  else await storage().remove(NOTICE_KEY);
}

export async function saveClientId(clientId: string): Promise<void> {
  const trimmed = clientId.trim();
  if (trimmed) await storage().set({ [CLIENT_ID_KEY]: trimmed });
  else await storage().remove(CLIENT_ID_KEY);
}

export async function readStatus(): Promise<XConnectionStatus> {
  if (!hasExtensionStorage()) {
    return { clientId: BUILD_TIME_CLIENT_ID, clientIdSource: BUILD_TIME_CLIENT_ID ? 'build' : 'none', account: null, notice: null };
  }
  const r = await storage().get([CLIENT_ID_KEY, NOTICE_KEY]);
  const stored = typeof r[CLIENT_ID_KEY] === 'string' ? (r[CLIENT_ID_KEY] as string) : '';
  const session = await readSession();
  return {
    clientId: stored || BUILD_TIME_CLIENT_ID,
    clientIdSource: stored ? 'settings' : BUILD_TIME_CLIENT_ID ? 'build' : 'none',
    account: session?.user ?? null,
    notice: typeof r[NOTICE_KEY] === 'string' ? (r[NOTICE_KEY] as string) : null,
  };
}

/** Calls back whenever connection-related storage changes (in any extension page). */
export function subscribeToStatus(onChange: () => void): () => void {
  if (!hasExtensionStorage()) return () => {};
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'local' && (SESSION_KEY in changes || CLIENT_ID_KEY in changes || NOTICE_KEY in changes)) onChange();
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
