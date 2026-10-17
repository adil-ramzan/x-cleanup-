import { useId } from 'react';
import { Icon } from './Icon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search' }: SearchInputProps) {
  const id = useId();
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon
        name="search"
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field w-full pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
