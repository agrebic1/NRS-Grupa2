'use client';

import { useState } from 'react';
import {
  Sunrise,
  Sun,
  Sunset,
  SlidersHorizontal,
  CalendarDays,
  Check,
  Plus,
  X,
  Star,
} from 'lucide-react';
import { KalendarOdabir } from '@/components/ui/KalendarOdabir';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import type { TerminSlot } from '@/domain/types/servisirane';

// ─── Period helpers ───────────────────────────────────────────────────────────

interface PeriodInfo {
  boja: string;
  oznaka: string;
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

function getPeriodInfo(from: string, to: string): PeriodInfo {
  if (from === '08:00' && to === '12:00')
    return { boja: '#F59E0B', oznaka: 'Jutro', Ikona: Sunrise };
  if (from === '12:00' && to === '17:00')
    return { boja: '#CA8A04', oznaka: 'Dan', Ikona: Sun };
  if (from === '17:00' && to === '20:00')
    return { boja: 'var(--first-secondary)', oznaka: 'Veče', Ikona: Sunset };
  if (from === '08:00' && to === '20:00')
    return { boja: '#16A34A', oznaka: 'Cijeli dan', Ikona: CalendarDays };
  return { boja: '#A855F7', oznaka: 'Prilagođeno', Ikona: SlidersHorizontal };
}

const BRZI_PERIODI = [
  { oznaka: 'Jutro', from: '08:00', to: '12:00', boja: '#F59E0B' },
  { oznaka: 'Dan', from: '12:00', to: '17:00', boja: '#CA8A04' },
  {
    oznaka: 'Veče',
    from: '17:00',
    to: '20:00',
    boja: 'var(--first-secondary)',
  },
  { oznaka: 'Cijeli dan', from: '08:00', to: '20:00', boja: '#16A34A' },
];

const TIP_OZNAKA = ['Primarni', 'Alternativni 1', 'Alternativni 2'] as const;
const TIP_BOJA = [
  'var(--first-primary)',
  'var(--first-secondary)',
  '#7C3AED',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type KorakTerminAžuriranje = {
  termini?: TerminSlot[];
  noPreferredTime?: boolean;
  preferredTimeLabel?: string | null; // kept for backward-compat
};

interface KorakTerminProps {
  termini: TerminSlot[];
  noPreferredTime: boolean;
  validationError?: string | null;
  onUpdate: (u: KorakTerminAžuriranje) => void;
}

// ─── TimeRange sub-component ──────────────────────────────────────────────────

function TimeRange({
  from,
  to,
  onFrom,
  onTo,
  onBrzi,
  disabled,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onBrzi: (from: string, to: string) => void;
  disabled?: boolean;
}) {
  const invalid = Boolean(from && to && from >= to);
  const { boja, oznaka, Ikona } = getPeriodInfo(from, to);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-end gap-2">
        <div
          className="flex min-w-0 flex-1 flex-col gap-1"
          style={{ minWidth: '90px' }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--first-nonary)' }}
          >
            Od
          </label>
          <input
            type="time"
            value={from}
            disabled={disabled}
            onChange={(e) => onFrom(e.target.value)}
            className="min-w-0 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: invalid
                ? '#DC2626'
                : 'rgb(var(--first-quaternary-rgb)/0.45)',
              backgroundColor: 'rgb(255 255 255/0.85)',
              color: 'var(--first-octonary)',
            }}
          />
        </div>
        <span
          className="mb-2 flex-shrink-0 text-sm"
          style={{ color: 'var(--first-quinary)' }}
        >
          -
        </span>
        <div
          className="flex min-w-0 flex-1 flex-col gap-1"
          style={{ minWidth: '90px' }}
        >
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--first-nonary)' }}
          >
            Do
          </label>
          <input
            type="time"
            value={to}
            disabled={disabled}
            onChange={(e) => onTo(e.target.value)}
            className="min-w-0 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: invalid
                ? '#DC2626'
                : 'rgb(var(--first-quaternary-rgb)/0.45)',
              backgroundColor: 'rgb(255 255 255/0.85)',
              color: 'var(--first-octonary)',
            }}
          />
        </div>
        {from && to && !invalid && (
          <div
            className="mb-0.5 flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold"
            style={{
              backgroundColor: `${boja}18`,
              color: boja,
              border: `1px solid ${boja}35`,
            }}
          >
            <Ikona className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{oznaka}</span>
          </div>
        )}
      </div>
      {invalid && (
        <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
          &quot;Vrijeme do&quot; mora biti nakon &quot;Vrijeme od&quot;.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {BRZI_PERIODI.map((p) => {
          const aktivan = from === p.from && to === p.to;
          return (
            <button
              key={p.oznaka}
              type="button"
              disabled={disabled}
              onClick={() => onBrzi(p.from, p.to)}
              className="rounded-md border px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: aktivan
                  ? p.boja
                  : 'rgb(var(--first-quaternary-rgb)/0.4)',
                backgroundColor: aktivan ? `${p.boja}15` : 'transparent',
                color: aktivan ? p.boja : 'var(--first-nonary)',
              }}
            >
              {p.oznaka}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slot summary pill ────────────────────────────────────────────────────────

function danasIsoLok(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function SlotCard({
  index,
  slot,
  aktivan,
  disabled,
  onClick,
  onUkloni,
}: {
  index: number;
  slot: TerminSlot | null;
  aktivan: boolean;
  disabled: boolean;
  onClick: () => void;
  onUkloni: (() => void) | null;
}) {
  const boja = TIP_BOJA[index]!;
  const oznaka = TIP_OZNAKA[index]!;
  const popunjen = Boolean(slot?.date);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative flex min-w-0 flex-1 flex-col items-start rounded-xl p-3 text-left transition-all disabled:opacity-40"
      style={{
        backgroundColor: aktivan
          ? `color-mix(in srgb, ${boja} 7%, transparent)`
          : 'rgb(255 255 255/0.8)',
        border: aktivan
          ? `2px solid ${boja}`
          : '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
      }}
    >
      {/* Type label */}
      <div className="flex items-center gap-1 mb-1.5">
        {index === 0 && (
          <Star className="h-3 w-3 flex-shrink-0" style={{ color: boja }} />
        )}
        {index > 0 && !popunjen && (
          <Plus
            className="h-3 w-3 flex-shrink-0"
            style={{ color: 'var(--first-nonary)' }}
          />
        )}
        <span
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: aktivan ? boja : 'var(--first-nonary)' }}
        >
          {oznaka}
        </span>
      </div>

      {/* Content */}
      {popunjen ? (
        <div className="min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{ color: 'var(--first-octonary)' }}
          >
            {formatirajDatumPrikaz(slot!.date)}
          </p>
          {slot!.from && slot!.to && (
            <p
              className="text-[10px] tabular-nums mt-0.5"
              style={{ color: 'var(--first-nonary)' }}
            >
              {slot!.from}-{slot!.to}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          {index === 0 ? 'Odaberi datum i period' : 'Dodaj alternativni'}
        </p>
      )}

      {/* Remove button for non-primary filled slots */}
      {onUkloni && popunjen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUkloni();
          }}
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-red-50"
          style={{ color: '#DC2626' }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KorakTermin({
  termini,
  noPreferredTime,
  validationError,
  onUpdate,
}: KorakTerminProps) {
  const [aktivniSlot, setAktivniSlot] = useState<0 | 1 | 2>(0);

  const slot0 = termini[0] ?? null;
  const slot1 = termini[1] ?? null;
  const slot2 = termini[2] ?? null;
  const slotovi = [slot0, slot1, slot2];

  const danas = danasIsoLok();

  // Determine which slots are "accessible" (can't add alt1 before primary is filled)
  const slot1Dostupan = Boolean(slot0?.date && slot0.from && slot0.to);
  const slot2Dostupan = Boolean(slot1?.date && slot1.from && slot1.to);

  function updateSlot(i: number, partial: Partial<TerminSlot>) {
    const stari = slotovi[i] ?? { date: '', from: '', to: '' };
    const novi = { ...stari, ...partial } as TerminSlot;
    const noviTermini = slotovi
      .map((s, idx) => (idx === i ? novi : s))
      .filter(Boolean) as TerminSlot[];
    onUpdate({ termini: noviTermini });
  }

  function ukloniSlot(i: number) {
    // Remove slot i and shift subsequent slots down
    const noviTermini = slotovi
      .filter((_, idx) => idx !== i)
      .filter(Boolean) as TerminSlot[];
    onUpdate({ termini: noviTermini });
    if (aktivniSlot >= noviTermini.length) {
      setAktivniSlot(Math.max(0, noviTermini.length - 1) as 0 | 1 | 2);
    }
  }

  function postaviNemaPreferencije(ukljuceno: boolean) {
    if (ukljuceno) {
      onUpdate({ termini: [], noPreferredTime: true });
    } else {
      onUpdate({ noPreferredTime: false });
    }
  }

  const aktivniSlotData = slotovi[aktivniSlot] ?? null;
  const selectedDates = aktivniSlotData?.date ? [aktivniSlotData.date] : [];
  const dateColors: Record<string, string> = {};
  slotovi.forEach((s, i) => {
    if (s?.date) dateColors[s.date] = TIP_BOJA[i] ?? 'var(--first-secondary)';
  });

  const bozaAktivnog = TIP_BOJA[aktivniSlot]!;

  const helperPoruka = !aktivniSlotData?.date
    ? 'Prvo odaberite datum, zatim vremenski period.'
    : 'Odaberite period ili koristite brzi izbor.';

  return (
    <div className="flex flex-col gap-4">
      {/* Heading */}
      <div>
        <h2
          className="mb-1 text-xl font-bold"
          style={{ color: 'var(--first-octonary)' }}
        >
          Preferirani termini
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--first-nonary)' }}
        >
          Odaberite do 3 termina koji vam odgovaraju. Primarni termin je vaš
          prvi izbor, alternativni su rezervni opcije. Konačan termin potvrđuje
          dispečer.
        </p>
      </div>

      {/* No preference toggle */}
      <button
        type="button"
        onClick={() => postaviNemaPreferencije(!noPreferredTime)}
        className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all"
        style={{
          borderColor: noPreferredTime
            ? 'var(--first-primary)'
            : 'rgb(var(--first-quaternary-rgb)/0.4)',
          backgroundColor: noPreferredTime
            ? 'rgb(var(--first-primary-rgb)/0.06)'
            : 'rgb(255 255 255/0.7)',
          color: 'var(--first-octonary)',
        }}
      >
        <div
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
          style={{
            backgroundColor: noPreferredTime
              ? 'var(--first-primary)'
              : 'transparent',
            border: noPreferredTime
              ? 'none'
              : '1.5px solid rgb(var(--first-quaternary-rgb)/0.6)',
          }}
        >
          {noPreferredTime && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span>Nemam preferirani termin - kontaktirajte me radi dogovora</span>
          {noPreferredTime && (
            <span
              className="text-xs font-normal"
              style={{ color: 'var(--first-nonary)' }}
            >
              Zahtjev će biti poslan bez preferiranog termina.
            </span>
          )}
        </div>
      </button>

      {!noPreferredTime && (
        <>
          {/* Slot selector cards */}
          <div className="flex gap-2">
            {([0, 1, 2] as const).map((i) => {
              const dostupan =
                i === 0 ||
                (i === 1 && slot1Dostupan) ||
                (i === 2 && slot2Dostupan);
              return (
                <SlotCard
                  key={i}
                  index={i}
                  slot={slotovi[i]}
                  aktivan={aktivniSlot === i}
                  disabled={!dostupan}
                  onClick={() => dostupan && setAktivniSlot(i)}
                  onUkloni={i > 0 ? () => ukloniSlot(i) : null}
                />
              );
            })}
          </div>

          {/* Active slot info */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: `color-mix(in srgb, ${bozaAktivnog} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${bozaAktivnog} 20%, transparent)`,
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: bozaAktivnog }}
            >
              Uređujete: {TIP_OZNAKA[aktivniSlot]}
            </span>
          </div>

          {/* Calendar + time picker */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Calendar */}
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.3)',
              }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Datum - {TIP_OZNAKA[aktivniSlot]}
              </p>
              <KalendarOdabir
                jedanDatum
                odabraniDatumi={selectedDates}
                onPromjena={(datumi) => {
                  const d = datumi[0] ?? null;
                  if (d && noPreferredTime)
                    onUpdate({ noPreferredTime: false });
                  updateSlot(aktivniSlot, { date: d ?? '' });
                }}
                dateColors={dateColors}
              />
            </div>

            {/* Time range */}
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.3)',
                opacity: aktivniSlotData?.date ? 1 : 0.6,
              }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Vremenski period
              </p>
              <TimeRange
                from={aktivniSlotData?.from ?? ''}
                to={aktivniSlotData?.to ?? ''}
                onFrom={(v) => updateSlot(aktivniSlot, { from: v })}
                onTo={(v) => updateSlot(aktivniSlot, { to: v })}
                onBrzi={(from, to) => updateSlot(aktivniSlot, { from, to })}
                disabled={!aktivniSlotData?.date}
              />
              <p
                className="mt-3 text-xs"
                style={{ color: 'var(--first-quinary)' }}
              >
                {helperPoruka}
              </p>

              {aktivniSlotData?.date &&
                aktivniSlotData.from &&
                aktivniSlotData.to && (
                  <div
                    className="mt-3 rounded-lg border px-3 py-2 text-xs"
                    style={{
                      borderColor: 'rgb(var(--first-quaternary-rgb)/0.35)',
                      backgroundColor: 'rgb(var(--first-quinary-rgb)/0.12)',
                      color: 'var(--first-nonary)',
                    }}
                  >
                    <p>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        Datum:
                      </span>{' '}
                      {formatirajDatumPrikaz(aktivniSlotData.date)}
                    </p>
                    <p className="mt-1">
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        Period:
                      </span>{' '}
                      {aktivniSlotData.from} - {aktivniSlotData.to}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Past-date warning */}
          {aktivniSlotData?.date && aktivniSlotData.date < danas && (
            <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
              Odabrani datum je u prošlosti. Odaberite budući datum.
            </p>
          )}

          {/* Summary of filled slots */}
          {termini.length > 0 && (
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)',
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.08)',
              }}
            >
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Odabrani termini ({termini.length}/3)
              </p>
              <div className="flex flex-col gap-1">
                {termini.map((t, i) =>
                  t?.date ? (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${TIP_BOJA[i]} 12%, transparent)`,
                          color: TIP_BOJA[i],
                        }}
                      >
                        {TIP_OZNAKA[i]}
                      </span>
                      <span style={{ color: 'var(--first-octonary)' }}>
                        {formatirajDatumPrikaz(t.date)}
                        {t.from && t.to ? `, ${t.from}-${t.to}` : ''}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Clear all */}
          {termini.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onUpdate({ termini: [], noPreferredTime: false })
                }
                className="px-1 py-1 text-sm font-medium transition-opacity hover:opacity-75"
                style={{ color: 'var(--first-primary)' }}
              >
                Očisti sve termine
              </button>
            </div>
          )}
        </>
      )}

      {validationError && (
        <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
          {validationError}
        </p>
      )}
    </div>
  );
}
