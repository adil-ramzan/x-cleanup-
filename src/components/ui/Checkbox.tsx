import { useEffect, useRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
}

export function Checkbox({ indeterminate = false, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-checked={indeterminate ? 'mixed' : undefined}
      className={cn(
        'h-4 w-4 cursor-pointer rounded border-slate-300 accent-brand-600 disabled:cursor-not-allowed',
        className,
      )}
      {...rest}
    />
  );
}
