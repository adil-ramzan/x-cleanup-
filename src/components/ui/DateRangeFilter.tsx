import { useId } from 'react';
import type { DateRange, DateRangePreset } from '../../types/filters';
import { DATE_RANGE_PRESETS, isCustomRangeInvalid } from '../../utils/filters';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const id = useId();
  const invalid = isCustomRangeInvalid(value);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`${id}-preset`} className="sr-only">
        Date range
      </label>
      <select
        id={`${id}-preset`}
        value={value.preset}
        onChange={(e) => onChange({ ...value, preset: e.target.value as DateRangePreset })}
        className="field cursor-pointer pr-8"
      >
        {DATE_RANGE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {value.preset === 'custom' && (
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Custom date range</legend>
          <label htmlFor={`${id}-from`} className="sr-only">
            From date
          </label>
          <input
            id={`${id}-from`}
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="field"
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-error` : undefined}
          />
          <span className="text-slate-400" aria-hidden="true">
            –
          </span>
          <label htmlFor={`${id}-to`} className="sr-only">
            To date
          </label>
          <input
            id={`${id}-to`}
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="field"
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-error` : undefined}
          />
          {invalid && (
            <p id={`${id}-error`} className="w-full text-xs text-red-600">
              The start date must be on or before the end date.
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
