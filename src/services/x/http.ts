import { XError } from './errors';

/** Shape of X API error bodies: v2 "problem" objects, OAuth errors, and legacy error arrays. */
interface XErrorBody {
  title?: string;
  detail?: string;
  type?: string;
  error?: string;
  error_description?: string;
  errors?: { message?: string; title?: string; detail?: string }[];
}

export async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Extracts X's own explanation from an error body, trimmed for display. Never includes request credentials. */
export function describeErrorBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as XErrorBody;
  const first = b.errors?.[0];
  const msg = b.detail ?? b.error_description ?? b.title ?? first?.detail ?? first?.message ?? first?.title ?? b.error;
  if (typeof msg !== 'string' || !msg.trim()) return null;
  return msg.trim().slice(0, 300);
}

/** Epoch ms from the x-rate-limit-reset header (Unix seconds), if present. */
export function rateLimitReset(res: Response): number | undefined {
  const raw = res.headers.get('x-rate-limit-reset');
  const seconds = raw ? Number(raw) : NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined;
}

/** Maps a non-2xx data-endpoint response to a typed error. 401 is handled by the caller (refresh + retry). */
export function errorFromResponse(res: Response, body: unknown): XError {
  const detail = describeErrorBody(body);
  const status = res.status;
  if (status === 429) {
    const retryAt = rateLimitReset(res);
    const when = retryAt ? ` Try again after ${new Date(retryAt).toLocaleTimeString()}.` : ' Try again later.';
    return new XError('rate_limited', `X’s rate limit for this request has been reached.${when}`, { retryAt, status });
  }
  if (status === 401) {
    return new XError('auth_expired', 'Your X session is no longer valid. Reconnect your account in Settings.', { status });
  }
  if (status === 402 || status === 403) {
    return new XError(
      'forbidden',
      `X declined this request (HTTP ${status}). This usually means the developer app lacks API access or credits for this endpoint.${detail ? ` X said: “${detail}”` : ''}`,
      { status },
    );
  }
  if (status >= 500) {
    return new XError('api', `X is having trouble right now (HTTP ${status}). Try again in a few minutes.`, { status });
  }
  return new XError('api', `X returned an error (HTTP ${status}).${detail ? ` ${detail}` : ''}`, { status });
}

/** fetch() that converts transport failures into a typed network error. */
export async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new XError('network', 'Couldn’t reach X. Check your internet connection and try again.');
  }
}
