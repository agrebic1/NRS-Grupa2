'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  currentLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      id,
      showCharacterCount,
      maxCharacters,
      currentLength = 0,
      ...props
    },
    ref,
  ) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const isOverLimit =
      maxCharacters !== undefined && currentLength > maxCharacters;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={textareaId}
          className="text-sm font-medium"
          style={{ color: 'var(--first-octonary)' }}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          {...props}
          className={[
            'w-full resize-none rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 break-words [overflow-wrap:anywhere]',
            'placeholder:text-text-muted/60',
            'focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-mystic-ember bg-mystic-ember/5 focus:ring-mystic-ember/25 focus:border-mystic-ember'
              : 'border-soft-beige bg-white/60 hover:border-celestial-teal focus:border-celestial-teal focus:ring-celestial-teal/20',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ color: 'var(--first-octonary)' }}
        />
        <div className="flex items-center justify-between">
          {error ? <ErrorMessage message={error} /> : <span />}
          {showCharacterCount && maxCharacters !== undefined && (
            <span
              className="text-xs font-medium"
              style={{
                color: isOverLimit
                  ? 'var(--first-senary)'
                  : 'var(--first-nonary)',
              }}
            >
              {currentLength}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
