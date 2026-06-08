'use client';

import { Search, X } from 'lucide-react';
import type {
  StatusFilterKorisnika,
  UlogaFilterKorisnika,
} from '@/lib/admin/korisniciFilter';
import type { StatusKorisnika } from '@/lib/admin/statusKorisnika';

const STATUS_OPCIJE: { value: StatusFilterKorisnika; label: string }[] = [
  { value: 'svi', label: 'Svi statusi' },
  { value: 'aktivan', label: 'Aktivan' },
  { value: 'neaktivan', label: 'Neaktivan' },
  { value: 'suspendovan', label: 'Suspendovan' },
];

const ULOGA_OPCIJE: { value: UlogaFilterKorisnika; label: string }[] = [
  { value: 'svi', label: 'Sve uloge' },
  { value: 'korisnik_usluge', label: 'Korisnik usluge' },
  { value: 'serviser', label: 'Serviser' },
  { value: 'dispecer', label: 'Dispečer' },
  { value: 'administrator', label: 'Administrator' },
];

export interface AdminKorisniciPretragaFilterProps {
  pretraga: string;
  onPretragaChange: (v: string) => void;
  statusFilter: StatusFilterKorisnika;
  onStatusFilterChange: (v: StatusFilterKorisnika) => void;
  ulogaFilter: UlogaFilterKorisnika;
  onUlogaFilterChange: (v: UlogaFilterKorisnika) => void;
  brojRezultata?: number;
}

export function AdminKorisniciPretragaFilter({
  pretraga,
  onPretragaChange,
  statusFilter,
  onStatusFilterChange,
  ulogaFilter,
  onUlogaFilterChange,
  brojRezultata,
}: AdminKorisniciPretragaFilterProps) {
  const imaAktivneFiltere =
    pretraga.trim().length > 0 ||
    statusFilter !== 'svi' ||
    ulogaFilter !== 'svi';

  function resetujFiltere() {
    onPretragaChange('');
    onStatusFilterChange('svi');
    onUlogaFilterChange('svi');
  }

  return (
    <section
      className="mb-6 space-y-3 rounded-2xl p-4"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
      }}
      aria-label="Pretraga i filtriranje korisnika"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="admin-korisnici-pretraga"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Pretraga
          </label>
          <div
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
              backgroundColor: 'rgb(255 255 255 / 0.92)',
            }}
          >
            <Search
              className="h-4 w-4 flex-shrink-0"
              aria-hidden
              style={{ color: 'var(--first-nonary)' }}
            />
            <input
              id="admin-korisnici-pretraga"
              type="search"
              placeholder='Npr. ime, email ili „TEST"'
              value={pretraga}
              onChange={(e) => onPretragaChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/30 rounded"
              style={{ color: 'var(--first-octonary)' }}
              aria-describedby="admin-korisnici-pretraga-hint"
            />
            {pretraga.trim() && (
              <button
                type="button"
                onClick={() => onPretragaChange('')}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/[0.05]"
                aria-label="Obriši pretragu"
              >
                <X
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--first-nonary)' }}
                />
              </button>
            )}
          </div>
          <p
            id="admin-korisnici-pretraga-hint"
            className="mt-1 text-xs"
            style={{ color: 'var(--first-nonary)' }}
          >
            Filtrira listu po imenu, prezimenu, emailu ili nazivu uloge.
          </p>
        </div>
        {typeof brojRezultata === 'number' && (
          <p
            className="shrink-0 text-sm tabular-nums"
            style={{ color: 'var(--first-nonary)' }}
          >
            <span
              className="font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              {brojRezultata}
            </span>{' '}
            {brojRezultata === 1 ? 'rezultat' : 'rezultata'}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span
            className="text-xs font-semibold shrink-0"
            style={{ color: 'var(--first-nonary)' }}
          >
            Status:
          </span>
          <select
            id="admin-korisnici-status-filter"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as StatusKorisnika | 'svi')
            }
            className="rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/30"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
              backgroundColor: 'rgb(255 255 255 / 0.92)',
              color: 'var(--first-octonary)',
            }}
            aria-label="Filter po statusu naloga"
          >
            {STATUS_OPCIJE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span
            className="text-xs font-semibold shrink-0"
            style={{ color: 'var(--first-nonary)' }}
          >
            Uloga:
          </span>
          <select
            id="admin-korisnici-uloga-filter"
            value={ulogaFilter}
            onChange={(e) =>
              onUlogaFilterChange(e.target.value as UlogaFilterKorisnika)
            }
            className="rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/30"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
              backgroundColor: 'rgb(255 255 255 / 0.92)',
              color: 'var(--first-octonary)',
            }}
            aria-label="Filter po korisničkoj ulozi"
          >
            {ULOGA_OPCIJE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {imaAktivneFiltere && (
          <button
            type="button"
            onClick={resetujFiltere}
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: 'var(--first-secondary)' }}
          >
            Resetuj filtere
          </button>
        )}
      </div>
    </section>
  );
}
