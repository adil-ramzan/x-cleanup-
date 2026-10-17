import { useId, type ReactNode } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { AccountConnection } from '../components/settings/AccountConnection';
import type { XConnectionStatus } from '../services/x/session';
import type { Preferences } from '../types/settings';
import { DATE_RANGE_PRESETS } from '../utils/filters';

interface SettingsPageProps {
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  connection: XConnectionStatus;
}

function SettingRow({ label, description, control }: { label: ReactNode; description: string; control: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Switch({ checked, onChange, labelledBy }: { checked: boolean; onChange: (v: boolean) => void; labelledBy: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function SettingsPage({ prefs, onChange, connection }: SettingsPageProps) {
  const id = useId();
  return (
    <>
      <PageHeader title="Settings" description="Preferences are saved locally in this browser." />

      <section aria-labelledby={`${id}-prefs`} className="card mb-6">
        <h2 id={`${id}-prefs`} className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">
          Preferences
        </h2>
        <div className="divide-y divide-slate-100">
          <SettingRow
            label={<label htmlFor={`${id}-range`}>Default date range</label>}
            description="Date range applied when you open the Posts, Reposts, or Replies pages."
            control={
              <select
                id={`${id}-range`}
                value={prefs.defaultDateRange}
                onChange={(e) => onChange({ defaultDateRange: e.target.value as Preferences['defaultDateRange'] })}
                className="field cursor-pointer pr-8"
              >
                {DATE_RANGE_PRESETS.filter((p) => p.value !== 'custom').map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            }
          />
          <SettingRow
            label={<span id={`${id}-density-label`}>Row density</span>}
            description="Compact rows fit more items on screen."
            control={
              <div role="group" aria-labelledby={`${id}-density-label`} className="inline-flex rounded-lg bg-slate-100 p-0.5">
                {(['comfortable', 'compact'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={prefs.rowDensity === d}
                    onClick={() => onChange({ rowDensity: d })}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      prefs.rowDensity === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            }
          />
          <SettingRow
            label={<span id={`${id}-confirm-label`}>Confirm before bulk actions</span>}
            description="Ask for confirmation before acting on selected items. Takes effect once bulk actions are available."
            control={
              <Switch
                checked={prefs.confirmBeforeBulkActions}
                onChange={(v) => onChange({ confirmBeforeBulkActions: v })}
                labelledBy={`${id}-confirm-label`}
              />
            }
          />
        </div>
      </section>

      <AccountConnection
        status={connection}
        useSampleData={prefs.useSampleData}
        onUseSampleDataChange={(useSampleData) => onChange({ useSampleData })}
      />
    </>
  );
}
