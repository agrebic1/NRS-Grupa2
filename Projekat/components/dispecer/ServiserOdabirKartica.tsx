'use client';

import { Check, Wrench, Briefcase } from 'lucide-react';
import type { ServiserZaDodjelu } from '@/domain/types/servisirane';

interface ServiserOdabirKarticaProps {
  serviser:  ServiserZaDodjelu;
  odabran:   boolean;
  onClick:   () => void;
  disabled?: boolean;
}

export function ServiserOdabirKartica({
  serviser,
  odabran,
  onClick,
  disabled,
}: ServiserOdabirKarticaProps) {
  const aktivnih = serviser.aktivnih_zadataka;
  const statusBoja =
    aktivnih === 0 ? '#22C55E' : aktivnih <= 2 ? '#D97706' : '#DC2626';
  const statusOznaka =
    aktivnih === 0 ? 'Slobodan' : aktivnih === 1 ? '1 aktivni' : aktivnih < 5 ? `${aktivnih} aktivna` : `${aktivnih} aktivnih`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all
        duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        borderColor:     odabran ? 'var(--first-primary)' : 'rgb(var(--first-quaternary-rgb) / 0.4)',
        backgroundColor: odabran ? 'rgb(var(--first-primary-rgb) / 0.06)' : 'rgb(255 255 255 / 0.7)',
        boxShadow:       odabran ? '0 0 0 1px rgb(var(--first-primary-rgb) / 0.3)' : 'none',
      }}
    >
      {/* Avatar inicijali */}
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{
          backgroundColor: odabran ? 'var(--first-primary)' : 'rgb(var(--first-quaternary-rgb) / 0.3)',
          color:           odabran ? '#ffffff' : 'var(--first-octonary)',
        }}
      >
        {serviser.ime.charAt(0)}{serviser.prezime.charAt(0)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            {serviser.ime} {serviser.prezime}
          </p>
          {/* Dostupnost */}
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: `${statusBoja}18`, color: statusBoja }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusBoja }} />
            {statusOznaka}
          </span>
        </div>

        {/* Specijalnosti */}
        {serviser.specialnosti.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {serviser.specialnosti.slice(0, 4).map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.3)',
                  color:           'var(--first-nonary)',
                }}
              >
                <Wrench className="h-2.5 w-2.5" />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Broj aktivnih zadataka */}
        <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
          <Briefcase className="h-3 w-3" />
          {aktivnih === 0
            ? 'Nema aktivnih zadataka'
            : `${aktivnih} aktivn${aktivnih === 1 ? 'i zadatak' : aktivnih < 5 ? 'a zadatka' : 'ih zadataka'}`}
        </div>
      </div>

      {/* Odabir indikator */}
      {odabran && (
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--first-primary)' }}
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}
