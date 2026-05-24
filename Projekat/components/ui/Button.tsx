'use client';

import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
}

// All hover states handled via Tailwind - no JS event handlers needed.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-deep-teal text-white',
    'hover:bg-celestial-teal',
    'disabled:opacity-50 disabled:hover:bg-deep-teal',
    'transition-colors duration-200',
  ].join(' '),
  secondary: [
    'bg-transparent text-deep-teal',
    'border border-soft-beige',
    'hover:border-celestial-teal hover:bg-celestial-teal/5',
    'disabled:opacity-50',
    'transition-colors duration-200',
  ].join(' '),
  danger: [
    'bg-mystic-ember text-white',
    'hover:bg-mystic-ember/80',
    'disabled:opacity-50',
    'transition-colors duration-200',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-muted',
    'hover:bg-muted-sand/30 hover:text-text-main',
    'disabled:opacity-50',
    'transition-colors duration-200',
  ].join(' '),
  outline: [
    'bg-transparent border-2 border-deep-teal text-deep-teal',
    'hover:bg-deep-teal hover:text-white',
    'disabled:opacity-50',
    'transition-colors duration-200',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'focus:outline-none focus:ring-2 focus:ring-celestial-teal/40 focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
