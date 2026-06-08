'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, endAdornment, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: 'var(--first-octonary)' }}
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={[
              'w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200',
              'placeholder:text-text-muted/60',
              'focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              endAdornment ? 'pr-11' : '',
              error
                ? 'border-mystic-ember bg-mystic-ember/5 focus:ring-mystic-ember/25 focus:border-mystic-ember'
                : 'border-soft-beige bg-white/60 hover:border-celestial-teal focus:border-celestial-teal focus:ring-celestial-teal/20',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ color: 'var(--first-octonary)' }}
          />
          {endAdornment && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <ErrorMessage message={error} />}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
