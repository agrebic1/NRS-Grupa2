'use client';

import { useState } from 'react';
import { Square, CheckSquare } from 'lucide-react';

// ─── Stavke checkliste ────────────────────────────────────────────────────────

const STAVKE: string[] = [
  'Pregledati prijavljeni problem na licu mjesta',
  'Potvrditi stanje i procijeniti potreban rad',
  'Izvršiti intervenciju prema planu',
  'Testirati ispravnost nakon intervencije',
  'Dokumentovati završeno stanje (fotografija)',
  'Unijeti završnu napomenu',
];

const UKUPNO = STAVKE.length;

// ─── Boje ─────────────────────────────────────────────────────────────────────

const ZELENA = '#22C55E';

// ─── Progress traka ────────────────────────────────────────────────────────────

function ProgressBar({ oznaceno, ukupno }: { oznaceno: number; ukupno: number }) {
  const postotak   = ukupno === 0 ? 0 : Math.round((oznaceno / ukupno) * 100);
  const sveDone    = oznaceno === ukupno;
  const boja       = sveDone ? ZELENA : 'var(--first-secondary)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold"
          style={{ color: sveDone ? ZELENA : 'var(--first-secondary)' }}
        >
          {oznaceno} / {ukupno} stavki završeno
        </p>
        <p
          className="text-xs font-bold tabular-nums"
          style={{ color: sveDone ? ZELENA : 'var(--first-nonary)' }}
        >
          {postotak}%
        </p>
      </div>

      {/* Traka */}
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.3)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width:           `${postotak}%`,
            backgroundColor: boja,
          }}
        />
      </div>
    </div>
  );
}

// ─── Jedna stavka ─────────────────────────────────────────────────────────────

interface StavkaProps {
  tekst:      string;
  oznacena:   boolean;
  readOnly:   boolean;
  onToggle:   () => void;
}

function ChecklistStavka({ tekst, oznacena, readOnly, onToggle }: StavkaProps) {
  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150"
      style={{
        backgroundColor: oznacena
          ? 'rgba(34,197,94,0.07)'
          : 'transparent',
        border: '1px solid',
        borderColor: oznacena
          ? 'rgba(34,197,94,0.2)'
          : 'rgb(var(--first-quaternary-rgb) / 0.25)',
        cursor: readOnly ? 'default' : 'pointer',
      }}
    >
      {/* Ikona */}
      <span className="mt-0.5 flex-shrink-0">
        {oznacena ? (
          <CheckSquare
            className="h-4.5 w-4.5"
            style={{
              color:  ZELENA,
              width:  '1.125rem',
              height: '1.125rem',
            }}
          />
        ) : (
          <Square
            className="h-4.5 w-4.5"
            style={{
              color:  'var(--first-nonary)',
              width:  '1.125rem',
              height: '1.125rem',
            }}
          />
        )}
      </span>

      {/* Tekst */}
      <span
        className="text-sm leading-snug"
        style={{
          color:          oznacena ? 'var(--first-nonary)' : 'var(--first-octonary)',
          textDecoration: oznacena ? 'line-through' : 'none',
          fontWeight:     oznacena ? 400 : 500,
          transition:     'all 0.2s',
        }}
      >
        {tekst}
      </span>
    </button>
  );
}

// ─── Glavna komponenta ────────────────────────────────────────────────────────

export function IntervencijaChecklist({ status }: { status: string }) {
  const jeZavrseno = status === 'zavrseno';

  // Ako je završeno, svi su označeni (read-only); inače korisnički state
  const [oznaceni, setOznaceni] = useState<boolean[]>(() =>
    Array(UKUPNO).fill(jeZavrseno),
  );

  // Sinkronizuj s props-om ako se status promijeni (npr. SSR hydration)
  const prikazOznaceni: boolean[] = jeZavrseno
    ? Array(UKUPNO).fill(true)
    : oznaceni;

  const brojOznacenih = prikazOznaceni.filter(Boolean).length;

  function toggle(idx: number) {
    if (jeZavrseno) return;
    setOznaceni((prev) => {
      const sljedeci = [...prev];
      sljedeci[idx] = !sljedeci[idx];
      return sljedeci;
    });
  }

  function oznacenSve() {
    if (jeZavrseno) return;
    const sveDone = prikazOznaceni.every(Boolean);
    setOznaceni(Array(UKUPNO).fill(!sveDone));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <ProgressBar oznaceno={brojOznacenih} ukupno={UKUPNO} />

      {/* Brzi gumb - samo ako nije read-only */}
      {!jeZavrseno && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={oznacenSve}
            className="text-xs font-medium underline-offset-2 transition-opacity duration-150 hover:opacity-70"
            style={{ color: 'var(--first-nonary)', textDecoration: 'underline' }}
          >
            {prikazOznaceni.every(Boolean) ? 'Odznači sve' : 'Označi sve'}
          </button>
        </div>
      )}

      {/* Lista stavki */}
      <div className="flex flex-col gap-2">
        {STAVKE.map((stavka, idx) => (
          <ChecklistStavka
            key={idx}
            tekst={stavka}
            oznacena={prikazOznaceni[idx]}
            readOnly={jeZavrseno}
            onToggle={() => toggle(idx)}
          />
        ))}
      </div>

      {/* Završena poruka */}
      {jeZavrseno && (
        <div
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border:          '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <CheckSquare className="h-4 w-4 flex-shrink-0" style={{ color: ZELENA }} />
          <p className="text-sm font-semibold" style={{ color: ZELENA }}>
            Sve stavke završene - intervencija je zaključena
          </p>
        </div>
      )}
    </div>
  );
}
