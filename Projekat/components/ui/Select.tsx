'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, id, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={selectId}
          className="text-sm font-medium"
          style={{ color: 'var(--first-octonary)' }}
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            {...props}
            className={[
              'w-full appearance-none rounded-xl border px-4 py-2.5 text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-mystic-ember bg-mystic-ember/5 focus:ring-mystic-ember/25 focus:border-mystic-ember'
                : 'border-soft-beige bg-white/60 hover:border-celestial-teal focus:border-celestial-teal focus:ring-celestial-teal/20',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ color: 'var(--first-octonary)' }}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--first-nonary)' }}
          />
        </div>
        {error && <ErrorMessage message={error} />}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
