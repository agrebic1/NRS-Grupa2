'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Square, CheckSquare } from 'lucide-react';

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

const ZELENA  = '#22C55E';
const CRVENA  = '#DC2626';

// ─── Progress traka ────────────────────────────────────────────────────────────

function ProgressBar({ oznaceno, ukupno }: { oznaceno: number; ukupno: number }) {
  const postotak = ukupno === 0 ? 0 : Math.round((oznaceno / ukupno) * 100);
  const sveDone  = oznaceno === ukupno;
  const boja     = sveDone ? ZELENA : 'var(--first-secondary)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: sveDone ? ZELENA : 'var(--first-secondary)' }}>
          {oznaceno} / {ukupno} stavki završeno
        </p>
        <p className="text-xs font-bold tabular-nums" style={{ color: sveDone ? ZELENA : 'var(--first-nonary)' }}>
          {postotak}%
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.3)' }}>
        <div className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${postotak}%`, backgroundColor: boja }} />
      </div>
    </div>
  );
}

// ─── Jedna stavka ─────────────────────────────────────────────────────────────

interface StavkaProps {
  tekst:       string;
  oznacena:    boolean;
  readOnly:    boolean;
  highlight:   boolean; // crvena ako nije označena a highlight je aktivan
  onToggle:    () => void;
}

function ChecklistStavka({ tekst, oznacena, readOnly, highlight, onToggle }: StavkaProps) {
  const jeUpozorena = highlight && !oznacena;

  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
      style={{
        backgroundColor: oznacena
          ? 'rgba(34,197,94,0.07)'
          : jeUpozorena
            ? 'rgba(220,38,38,0.05)'
            : 'transparent',
        border: '1px solid',
        borderColor: oznacena
          ? 'rgba(34,197,94,0.2)'
          : jeUpozorena
            ? 'rgba(220,38,38,0.3)'
            : 'rgb(var(--first-quaternary-rgb) / 0.25)',
        cursor: readOnly ? 'default' : 'pointer',
      }}
    >
      {/* Ikona */}
      <span className="mt-0.5 flex-shrink-0">
        {oznacena ? (
          <CheckSquare style={{ color: ZELENA, width: '1.125rem', height: '1.125rem' }} />
        ) : (
          <Square style={{
            color: jeUpozorena ? CRVENA : 'var(--first-nonary)',
            width: '1.125rem', height: '1.125rem',
          }} />
        )}
      </span>

      {/* Tekst */}
      <span className="text-sm leading-snug" style={{
        color:          oznacena ? 'var(--first-nonary)' : jeUpozorena ? CRVENA : 'var(--first-octonary)',
        textDecoration: oznacena ? 'line-through' : 'none',
        fontWeight:     oznacena ? 400 : jeUpozorena ? 600 : 500,
        transition:     'all 0.2s',
      }}>
        {tekst}
      </span>
    </button>
  );
}

// ─── Glavna komponenta ────────────────────────────────────────────────────────

interface IntervencijaChecklistProps {
  status:            string;
  /** Poziva se svaki put kad korisnik označi/odznači stavku. */
  onPromjena?:       (oznaceni: boolean[]) => void;
  /** Ako true, neoznačene stavke postaju crvene (validacija prije evidencije). */
  highlightNepopunjena?: boolean;
}

export function IntervencijaChecklist({
  status,
  onPromjena,
  highlightNepopunjena = false,
}: IntervencijaChecklistProps) {
  const jeZavrseno = status === 'zavrseno';

  const [oznaceni, setOznaceni] = useState<boolean[]>(() =>
    Array(UKUPNO).fill(jeZavrseno),
  );

  const prikazOznaceni: boolean[] = jeZavrseno ? Array(UKUPNO).fill(true) : oznaceni;
  const brojOznacenih = prikazOznaceni.filter(Boolean).length;
  const sveDone = brojOznacenih === UKUPNO;

  // Obavijesti roditeljsku komponentu o promjenama
  useEffect(() => {
    if (!jeZavrseno) onPromjena?.(oznaceni);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oznaceni, jeZavrseno]);

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
    const noviStanje = Array(UKUPNO).fill(!sveDone);
    setOznaceni(noviStanje);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <ProgressBar oznaceno={brojOznacenih} ukupno={UKUPNO} />

      {/* Upozorenje o nepopunjenim stavkama */}
      {highlightNepopunjena && !sveDone && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{
            backgroundColor: 'rgba(220,38,38,0.06)',
            border:          '1px solid rgba(220,38,38,0.25)',
          }}
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: CRVENA }} />
          <p className="text-xs font-semibold leading-snug" style={{ color: CRVENA }}>
            Potrebno je označiti sve stavke kontrolne liste prije evidencije rada.
            Još {UKUPNO - brojOznacenih} {UKUPNO - brojOznacenih === 1 ? 'stavka nije označena' : 'stavke nisu označene'}.
          </p>
        </div>
      )}

      {/* Brzi gumb */}
      {!jeZavrseno && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={oznacenSve}
            className="text-xs font-medium underline-offset-2 transition-opacity duration-150 hover:opacity-70"
            style={{ color: 'var(--first-nonary)', textDecoration: 'underline' }}
          >
            {sveDone ? 'Odznači sve' : 'Označi sve'}
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
            highlight={highlightNepopunjena}
            onToggle={() => toggle(idx)}
          />
        ))}
      </div>

      {/* Završena poruka */}
      {jeZavrseno && (
        <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <CheckSquare className="h-4 w-4 flex-shrink-0" style={{ color: ZELENA }} />
          <p className="text-sm font-semibold" style={{ color: ZELENA }}>
            Sve stavke završene - intervencija je zaključena
          </p>
        </div>
      )}
    </div>
  );
}
