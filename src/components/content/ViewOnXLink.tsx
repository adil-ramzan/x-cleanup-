import { Icon } from '../ui/Icon';

export function ViewOnXLink({ url, label = 'View on X' }: { url?: string; label?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
    >
      {label}
      <Icon name="external" size={11} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
