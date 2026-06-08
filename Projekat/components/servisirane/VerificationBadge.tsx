'use client';

import { ShieldCheck } from 'lucide-react';

interface VerificationBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function VerificationBadge({
  size = 'sm',
  showLabel = true,
}: VerificationBadgeProps) {
  const ikonaCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textCls = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${textCls}`}
      style={{
        backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)',
        color: 'var(--first-secondary)',
        border: '1px solid rgb(var(--first-secondary-rgb) / 0.3)',
      }}
      title="Verifikovani partner"
    >
      <ShieldCheck className={`${ikonaCls} flex-shrink-0`} />
      {showLabel && 'Verifikovan'}
    </span>
  );
}
