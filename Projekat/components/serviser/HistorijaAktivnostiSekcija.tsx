'use client';

import { useState } from 'react';
import { Activity, LayoutList, GitBranch } from 'lucide-react';
import type { InterventionActivity } from '@/domain/types/servisirane';
import { AktivnostiTimeline } from '@/components/serviser/AktivnostiTimeline';
import { AktivnostiTabela } from '@/components/serviser/AktivnostiTabela';

interface HistorijaAktivnostiSekcijaProps {
  aktivnosti: InterventionActivity[];
  ucitava?: boolean;
  className?: string;
  /** Podrazumijevani prikaz: tabela (US-44) ili timeline. */
  defaultPrikaz?: 'tabela' | 'timeline';
}

/** Historija aktivnosti - tabela i timeline (US-32, US-39, US-44). */
export function HistorijaAktivnostiSekcija({
  aktivnosti,
  ucitava,
  className = '',
  defaultPrikaz = 'tabela',
}: HistorijaAktivnostiSekcijaProps) {
  const [prikaz, setPrikaz] = useState<'tabela' | 'timeline'>(defaultPrikaz);

  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)',
        backgroundColor: 'rgb(255 255 255/0.92)',
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
          >
            <Activity className="h-4 w-4" style={{ color: 'var(--first-secondary)' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--first-octonary)' }}>
            Historija aktivnosti
          </p>
        </div>
        <div
          className="flex rounded-lg border p-0.5"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.35)' }}
          role="tablist"
          aria-label="Način prikaza historije"
        >
          <button
            type="button"
            role="tab"
            aria-selected={prikaz === 'tabela'}
            onClick={() => setPrikaz('tabela')}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: prikaz === 'tabela' ? 'rgb(var(--first-secondary-rgb)/0.12)' : 'transparent',
              color: prikaz === 'tabela' ? 'var(--first-secondary)' : 'var(--first-nonary)',
            }}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Tabela
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={prikaz === 'timeline'}
            onClick={() => setPrikaz('timeline')}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: prikaz === 'timeline' ? 'rgb(var(--first-secondary-rgb)/0.12)' : 'transparent',
              color: prikaz === 'timeline' ? 'var(--first-secondary)' : 'var(--first-nonary)',
            }}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Timeline
          </button>
        </div>
      </div>
      {prikaz === 'tabela' ? (
        <AktivnostiTabela aktivnosti={aktivnosti} ucitava={ucitava} />
      ) : (
        <AktivnostiTimeline aktivnosti={aktivnosti} ucitava={ucitava} />
      )}
    </div>
  );
}
