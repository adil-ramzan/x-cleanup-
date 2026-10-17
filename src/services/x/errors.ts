/**
 * Typed errors for X integration. Messages are user-facing and must never
 * include tokens, codes, or other credentials.
 */
export type XErrorCode =
  | 'not_configured' // no client ID
  | 'not_connected' // no session
  | 'auth_cancelled' // user closed or denied the X consent screen
  | 'auth_failed' // authorization or token exchange failed
  | 'auth_expired' // refresh token rejected: expired or revoked
  | 'rate_limited'
  | 'forbidden' // app lacks access, credits, or permission for the endpoint
  | 'network'
  | 'api';

export class XError extends Error {
  readonly code: XErrorCode;
  /** For rate_limited: when the window resets (epoch ms), if X reported it. */
  readonly retryAt?: number;
  readonly status?: number;

  constructor(code: XErrorCode, message: string, opts: { retryAt?: number; status?: number } = {}) {
    super(message);
    this.name = 'XError';
    this.code = code;
    this.retryAt = opts.retryAt;
    this.status = opts.status;
  }
}

export const isXError = (e: unknown): e is XError => e instanceof XError;

/** True for errors that mean the user must reconnect their account. */
export const needsReconnect = (e: unknown): boolean =>
  isXError(e) && (e.code === 'auth_expired' || e.code === 'not_connected');
