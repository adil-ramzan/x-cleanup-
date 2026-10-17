import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  /** Replaces the retry button, e.g. a link to reconnect. */
  action?: ReactNode;
}

export function ErrorState({ title = 'Couldn’t load this page', message, onRetry, action }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Icon name="alert" size={22} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {action ? (
        <div className="mt-5">{action}</div>
      ) : (
        onRetry && (
          <Button className="mt-5" onClick={onRetry}>
            <Icon name="refresh" size={14} />
            Try again
          </Button>
        )
      )}
    </div>
  );
}
