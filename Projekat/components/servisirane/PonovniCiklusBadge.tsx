'use client';

import { RotateCcw } from 'lucide-react';
import { labelPonovnogCiklusa } from '@/lib/servisirane/ponovniCiklus';

interface PonovniCiklusBadgeProps {
  broj: number;
  className?: string;
}

/** US-47: vizuelna oznaka ponovnog operativnog ciklusa. */
export function PonovniCiklusBadge({ broj, className = '' }: PonovniCiklusBadgeProps) {
  const label = labelPonovnogCiklusa(broj);
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{
        backgroundColor: 'rgba(217,119,6,0.12)',
        color: '#B45309',
        border: '1px solid rgba(217,119,6,0.35)',
      }}
      title="Intervencija je vraćena na ponovnu obradu ili označena kao nije riješena"
    >
      <RotateCcw className="h-3 w-3" />
      {label}
    </span>
  );
}
