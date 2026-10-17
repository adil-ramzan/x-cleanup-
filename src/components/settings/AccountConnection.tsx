import { useEffect, useId, useState } from 'react';
import { connect, disconnect, getRedirectUri, verifyConnection } from '../../services/x/auth';
import { isXError } from '../../services/x/errors';
import { saveClientId, type XConnectionStatus } from '../../services/x/session';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

type Busy = 'connecting' | 'disconnecting' | 'verifying' | 'saving' | null;
type Message = { tone: 'error' | 'info' | 'success'; text: string } | null;

interface AccountConnectionProps {
  status: XConnectionStatus;
  useSampleData: boolean;
  onUseSampleDataChange: (value: boolean) => void;
}

const MESSAGE_STYLES = {
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

function CopyField({ id, value }: { id: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input id={id} readOnly value={value} className="field min-w-0 flex-1 font-mono text-xs" onFocus={(e) => e.target.select()} />
      <Button
        size="md"
        onClick={() =>
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
        }
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

export function AccountConnection({ status, useSampleData, onUseSampleDataChange }: AccountConnectionProps) {
  const id = useId();
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<Message>(null);
  const [clientIdDraft, setClientIdDraft] = useState(status.clientId);
  const redirectUri = getRedirectUri();
  const account = status.account;

  useEffect(() => setClientIdDraft(status.clientId), [status.clientId]);

  async function run(kind: Exclude<Busy, null>, task: () => Promise<Message>) {
    setBusy(kind);
    setMessage(null);
    try {
      setMessage(await task());
    } catch (e) {
      const cancelled = isXError(e) && e.code === 'auth_cancelled';
      setMessage({
        tone: cancelled ? 'info' : 'error',
        text: e instanceof Error ? e.message : 'Something went wrong.',
      });
    } finally {
      setBusy(null);
    }
  }

  const statusBadge = account ? (
    <Badge tone="green">Connected</Badge>
  ) : status.clientId ? (
    <Badge>Not connected</Badge>
  ) : (
    <Badge tone="amber">Setup required</Badge>
  );

  return (
    <section aria-labelledby={`${id}-heading`} className="card">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id={`${id}-heading`} className="text-sm font-semibold text-slate-900">
          X account connection
        </h2>
        {statusBadge}
      </div>

      {/* Account row */}
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {account?.profileImageUrl ? (
            <img src={account.profileImageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="link" size={18} />
            </span>
          )}
          <div>
            {account ? (
              <>
                <p className="text-sm font-medium text-slate-900">{account.name}</p>
                <p className="text-sm text-slate-500">@{account.username} · read-only access</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-900">No account connected</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Sign in on X to grant read-only access. X Cleanup never sees your password.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {account ? (
            <>
              <Button
                disabled={busy !== null}
                onClick={() =>
                  run('verifying', async () => {
                    const user = await verifyConnection();
                    return { tone: 'success', text: `Connection is working (signed in as @${user.username}).` };
                  })
                }
              >
                {busy === 'verifying' ? 'Checking…' : 'Check connection'}
              </Button>
              <Button
                variant="ghost"
                disabled={busy !== null}
                onClick={() =>
                  run('disconnecting', async () => {
                    await disconnect();
                    return { tone: 'info', text: 'Disconnected. Access tokens were revoked and removed from this browser.' };
                  })
                }
              >
                {busy === 'disconnecting' ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              disabled={busy !== null || !status.clientId || !redirectUri}
              aria-describedby={!status.clientId ? `${id}-setup` : undefined}
              onClick={() =>
                run('connecting', async () => {
                  const user = await connect();
                  return { tone: 'success', text: `Connected as @${user.username}.` };
                })
              }
            >
              {busy === 'connecting' ? 'Waiting for X…' : 'Connect X account'}
            </Button>
          )}
        </div>
      </div>

      {(message || status.notice) && (
        <div className="px-5 pb-4">
          <p
            role={message?.tone === 'error' || (!message && status.notice) ? 'alert' : 'status'}
            className={cn('rounded-lg border px-3 py-2 text-sm', MESSAGE_STYLES[message?.tone ?? 'error'])}
          >
            {message?.text ?? status.notice}
          </p>
        </div>
      )}

      {/* Data source */}
      <div className="border-t border-slate-100 px-5 py-4">
        <fieldset>
          <legend className="text-sm font-medium text-slate-900">Data shown in the dashboard</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className={cn('flex items-center gap-2 text-sm', account ? 'text-slate-700' : 'text-slate-400')}>
              <input
                type="radio"
                name={`${id}-source`}
                className="accent-brand-600"
                checked={!!account && !useSampleData}
                disabled={!account}
                onChange={() => onUseSampleDataChange(false)}
              />
              Live data from X{account ? ` (@${account.username})` : ' — connect an account first'}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name={`${id}-source`}
                className="accent-brand-600"
                checked={!account || useSampleData}
                onChange={() => onUseSampleDataChange(true)}
              />
              Sample data (preview)
            </label>
          </div>
        </fieldset>
      </div>

      {/* Developer app configuration */}
      <details id={`${id}-setup`} open={!status.clientId} className="group border-t border-slate-100">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-slate-900">
          X developer app setup
          <span className="text-xs font-normal text-slate-400 group-open:hidden">Show</span>
          <span className="hidden text-xs font-normal text-slate-400 group-open:inline">Hide</span>
        </summary>
        <div className="space-y-4 px-5 pb-5 text-sm text-slate-600">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              In the{' '}
              <a href="https://console.x.com" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">
                X Developer Console
              </a>
              , create an app and enable <strong>OAuth 2.0</strong> user authentication.
            </li>
            <li>
              Set the app type to <strong>Native App</strong> (a public client — no client secret is used).
            </li>
            <li>Add the redirect URI below as a callback URL.</li>
            <li>Paste the app’s OAuth 2.0 <strong>Client ID</strong> here. Never enter a client secret.</li>
            <li>Make sure the developer account has API credits — X bills reads per record.</li>
          </ol>

          <div>
            <label htmlFor={`${id}-redirect`} className="mb-1 block text-xs font-medium text-slate-700">
              Redirect URI (callback URL)
            </label>
            {redirectUri ? (
              <CopyField id={`${id}-redirect`} value={redirectUri} />
            ) : (
              <p className="text-xs text-slate-500">Available when running as an installed extension.</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run('saving', async () => {
                await saveClientId(clientIdDraft);
                return { tone: 'success', text: clientIdDraft.trim() ? 'Client ID saved.' : 'Client ID cleared.' };
              });
            }}
          >
            <label htmlFor={`${id}-client`} className="mb-1 block text-xs font-medium text-slate-700">
              OAuth 2.0 Client ID
            </label>
            <div className="flex gap-2">
              <input
                id={`${id}-client`}
                value={clientIdDraft}
                onChange={(e) => setClientIdDraft(e.target.value)}
                className="field min-w-0 flex-1 font-mono text-xs"
                autoComplete="off"
                spellCheck={false}
                disabled={!!account}
                placeholder="e.g. aBcD1234efGH5678ijKL"
              />
              <Button type="submit" disabled={busy !== null || !!account || clientIdDraft.trim() === status.clientId}>
                Save
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {account
                ? 'Disconnect to change the client ID.'
                : status.clientIdSource === 'build'
                  ? 'Using the client ID provided at build time (VITE_X_CLIENT_ID). Saving here overrides it.'
                  : 'Stored locally in this browser.'}
            </p>
          </form>
        </div>
      </details>
    </section>
  );
}
