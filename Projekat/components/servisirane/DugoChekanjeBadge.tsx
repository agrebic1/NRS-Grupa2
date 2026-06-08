'use client';

import { Clock } from 'lucide-react';
import {
  getDugoChekanje,
  formatiraTrajanje,
  OPIS_TIPA,
} from '@/lib/servisirane/dugoChekanje';

interface DugoChekanjeBadgeProps {
  status: string;
  createdAt: string;
  /** Kompaktan prikaz bez teksta (samo ikona + trajanje). */
  kompaktan?: boolean;
}

/**
 * Prikazuje badge upozorenja za intervencije koje predugo čekaju bez
 * obrade ili dodjele (US-53). Vraća null ako uslovi nisu ispunjeni.
 */
export function DugoChekanjeBadge({
  status,
  createdAt,
  kompaktan = false,
}: DugoChekanjeBadgeProps) {
  const info = getDugoChekanje(status, createdAt);
  if (!info) return null;

  const trajanjeStr = formatiraTrajanje(info.trajanje_ms);
  const opisStr = OPIS_TIPA[info.tip];

  if (kompaktan) {
    return (
      <span
        title={`${opisStr} (${trajanjeStr})`}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{
          backgroundColor: 'rgba(217,119,6,0.1)',
          color: '#B45309',
          border: '1px solid rgba(217,119,6,0.3)',
        }}
      >
        <Clock className="h-2.5 w-2.5" />
        {trajanjeStr}
      </span>
    );
  }

  return (
    <span
      title={opisStr}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        backgroundColor: 'rgba(217,119,6,0.1)',
        color: '#B45309',
        border: '1px solid rgba(217,119,6,0.3)',
      }}
    >
      <Clock className="h-3 w-3 flex-shrink-0" />
      <span>{opisStr}</span>
      <span
        className="rounded px-1 py-px text-[10px]"
        style={{ backgroundColor: 'rgba(217,119,6,0.15)', color: '#92400E' }}
      >
        {trajanjeStr}
      </span>
    </span>
  );
}
