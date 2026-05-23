'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntervencijaRef {
  id: number;
  termin_planirani_pocetak?: string | null;
  status: string;
}

interface MiniKalendarProps {
  intervencije: IntervencijaRef[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DANI_KRATKO = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

const MJESECI = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  return dateToStr(new Date());
}

function isoToDayStr(iso: string): string {
  return dateToStr(new Date(iso));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MiniKalendar({ intervencije, selectedDate, onSelectDate }: MiniKalendarProps) {
  const danas = todayStr();

  const [godinaM, setGodinaM] = useState(() => {
    const d = new Date();
    return { godina: d.getFullYear(), mjesec: d.getMonth() };
  });

  // Map each day → {aktivne, zavrsene} counts
  const daniInfo = useMemo(() => {
    const m: Record<string, { aktivne: number; zavrsene: number }> = {};
    for (const z of intervencije) {
      if (!z.termin_planirani_pocetak) continue;
      const dan = isoToDayStr(z.termin_planirani_pocetak);
      if (!m[dan]) m[dan] = { aktivne: 0, zavrsene: 0 };
      if (['zavrseno', 'zatvoreno'].includes(z.status)) m[dan].zavrsene++;
      else m[dan].aktivne++;
    }
    return m;
  }, [intervencije]);

  // Build 7-column calendar grid starting on Monday
  const daniGrid = useMemo(() => {
    const { godina, mjesec } = godinaM;
    const prvog   = new Date(godina, mjesec, 1);
    const zadnjeg = new Date(godina, mjesec + 1, 0);
    // ISO week: Monday=1…Sunday=7, map to 0-based Mon=0
    const pocetakOffset = (prvog.getDay() + 6) % 7;

    const grid: Array<{ date: string; dayNum: number; uMjesecu: boolean }> = [];

    for (let i = pocetakOffset - 1; i >= 0; i--) {
      const d = new Date(godina, mjesec, -i);
      grid.push({ date: dateToStr(d), dayNum: d.getDate(), uMjesecu: false });
    }
    for (let i = 1; i <= zadnjeg.getDate(); i++) {
      const d = new Date(godina, mjesec, i);
      grid.push({ date: dateToStr(d), dayNum: i, uMjesecu: true });
    }
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(godina, mjesec + 1, i);
      grid.push({ date: dateToStr(d), dayNum: d.getDate(), uMjesecu: false });
    }
    return grid;
  }, [godinaM]);

  function prevMjesec() {
    setGodinaM(({ godina, mjesec }) =>
      mjesec === 0 ? { godina: godina - 1, mjesec: 11 } : { godina, mjesec: mjesec - 1 }
    );
  }

  function nextMjesec() {
    setGodinaM(({ godina, mjesec }) =>
      mjesec === 11 ? { godina: godina + 1, mjesec: 0 } : { godina, mjesec: mjesec + 1 }
    );
  }

  function goToToday() {
    const d = new Date();
    setGodinaM({ godina: d.getFullYear(), mjesec: d.getMonth() });
    onSelectDate(null);
  }

  const jeCurrentMonth =
    godinaM.godina === new Date().getFullYear() && godinaM.mjesec === new Date().getMonth();

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'rgb(255 255 255/0.85)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.32)',
      }}
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.25)' }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" style={{ color: 'var(--first-secondary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--first-octonary)' }}>
            {MJESECI[godinaM.mjesec]} {godinaM.godina}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!jeCurrentMonth && (
            <button
              type="button"
              onClick={goToToday}
              className="mr-1 rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(var(--first-primary-rgb)/0.08)', color: 'var(--first-primary)' }}
            >
              Danas
            </button>
          )}
          <button
            type="button"
            onClick={prevMjesec}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-black/[0.06]"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMjesec}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-black/[0.06]"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Day-of-week labels ───────────────────────────────────────────── */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DANI_KRATKO.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ─── Day grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-px px-3 pb-3">
        {daniGrid.map(({ date, dayNum, uMjesecu }) => {
          const jeSelected   = selectedDate === date;
          const jeDanas      = date === danas;
          const info         = daniInfo[date];
          const imaAktivnih  = (info?.aktivne ?? 0) > 0;
          const imaZavrsenih = (info?.zavrsene ?? 0) > 0;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(jeSelected ? null : date)}
              className="relative flex flex-col items-center rounded-lg py-1.5 transition-all hover:bg-black/[0.04]"
              style={{
                opacity: uMjesecu ? 1 : 0.3,
                backgroundColor: jeSelected
                  ? 'var(--first-primary)'
                  : jeDanas && !jeSelected
                  ? 'rgb(var(--first-primary-rgb)/0.09)'
                  : undefined,
                color: jeSelected
                  ? '#fff'
                  : jeDanas
                  ? 'var(--first-primary)'
                  : 'var(--first-octonary)',
                fontWeight: jeDanas || jeSelected ? 700 : 400,
              }}
            >
              <span className="text-[12px] leading-tight">{dayNum}</span>
              {(imaAktivnih || imaZavrsenih) && (
                <div className="mt-0.5 flex gap-0.5">
                  {imaAktivnih && (
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{
                        backgroundColor: jeSelected ? '#fff' : 'var(--first-secondary)',
                      }}
                    />
                  )}
                  {imaZavrsenih && (
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{
                        backgroundColor: jeSelected
                          ? 'rgba(255,255,255,0.5)'
                          : 'var(--first-nonary)',
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Legend ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-4 pb-3 text-[10px]"
        style={{ color: 'var(--first-nonary)' }}
      >
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--first-secondary)' }}
          />
          Aktivne
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--first-nonary)' }}
          />
          Završene
        </div>
      </div>

      {/* ─── Selected date info ───────────────────────────────────────────── */}
      {selectedDate && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
        >
          <p
            className="mb-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Odabrani datum
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('bs-BA', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
          {(() => {
            const info  = daniInfo[selectedDate];
            const total = (info?.aktivne ?? 0) + (info?.zavrsene ?? 0);
            return (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--first-nonary)' }}>
                {total === 0
                  ? 'Nema planiranih intervencija'
                  : `${total} ${total === 1 ? 'intervencija' : 'intervencija'}`}
              </p>
            );
          })()}
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="mt-2 text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            × Ukloni filter datuma
          </button>
        </div>
      )}
    </div>
  );
}
