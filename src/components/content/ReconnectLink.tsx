import { routeHref } from '../../dashboard/routes';

export function ReconnectLink() {
  return (
    <a
      href={routeHref('settings')}
      className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
    >
      Go to account settings
    </a>
  );
}
