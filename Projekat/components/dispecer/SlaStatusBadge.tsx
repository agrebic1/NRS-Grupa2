'use client';

import { Clock, AlertTriangle } from 'lucide-react';
import type { SlaStatus } from '@/lib/servisirane/slaPravila';
import {
  getSlaStatus,
  formatirајPreostaloVrijeme,
} from '@/lib/servisirane/slaPravila';

interface SlaStatusBadgeProps {
  createdAt: string;
  prioritet: string | null;
  status: string;
  prikaziVrijeme?: boolean;
}

const KONFIGURACIJA: Record<
  SlaStatus,
  {
    boja: string;
    rgb: string;
    tekst: string;
    Ikona: typeof Clock;
  }
> = {
  ok: {
    boja: '#16A34A',
    rgb: '22,163,74',
    tekst: 'SLA OK',
    Ikona: Clock,
  },
  upozorenje: {
    boja: '#D97706',
    rgb: '217,119,6',
    tekst: 'SLA ističe',
    Ikona: AlertTriangle,
  },
  prekoraceno: {
    boja: '#DC2626',
    rgb: '220,38,38',
    tekst: 'SLA prekoračen',
    Ikona: AlertTriangle,
  },
};

export function SlaStatusBadge({
  createdAt,
  prioritet,
  status,
  prikaziVrijeme = false,
}: SlaStatusBadgeProps) {
  const slaStatus = getSlaStatus(createdAt, prioritet, status);
  if (!slaStatus) return null;

  const cfg = KONFIGURACIJA[slaStatus];
  const Ikona = cfg.Ikona;
  const vrijemeTxt = prikaziVrijeme
    ? formatirајPreostaloVrijeme(createdAt, prioritet)
    : null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        backgroundColor: `rgba(${cfg.rgb},0.1)`,
        color: cfg.boja,
        border: `1px solid rgba(${cfg.rgb},0.25)`,
      }}
    >
      <Ikona className="h-2.5 w-2.5 flex-shrink-0" />
      {cfg.tekst}
      {vrijemeTxt ? ` (${vrijemeTxt})` : ''}
    </span>
  );
}
