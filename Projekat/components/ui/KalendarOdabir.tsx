'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DANI = ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne'];
const MJESECI = [
  'Januar',
  'Februar',
  'Mart',
  'April',
  'Maj',
  'Juni',
  'Juli',
  'August',
  'Septembar',
  'Oktobar',
  'Novembar',
  'Decembar',
];

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface KalendarOdabirProps {
  odabraniDatumi: string[];
  onPromjena: (datumi: string[]) => void;
  /** Boja po datumu - svaki datum može imati različitu boju */
  dateColors?: Record<string, string>;
  /** Jedan datum (Sprint 7 preferirani termin); novi klik zamjenjuje odabir. */
  jedanDatum?: boolean;
}

export function KalendarOdabir({
  odabraniDatumi,
  onPromjena,
  dateColors,
  jedanDatum = false,
}: KalendarOdabirProps) {
  const danas = new Date();
  const danasIso = toIso(danas);

  const [aktivan, setAktivan] = useState(
    new Date(danas.getFullYear(), danas.getMonth(), 1),
  );

  const godina = aktivan.getFullYear();
  const mjesec = aktivan.getMonth();

  const prvaDana = new Date(godina, mjesec, 1);
  const zadnjiDan = new Date(godina, mjesec + 1, 0);
  let offsetPrvog = prvaDana.getDay();
  offsetPrvog = offsetPrvog === 0 ? 6 : offsetPrvog - 1;

  const danovi: (Date | null)[] = [
    ...Array<null>(offsetPrvog).fill(null),
    ...Array.from(
      { length: zadnjiDan.getDate() },
      (_, i) => new Date(godina, mjesec, i + 1),
    ),
  ];

  function toggleDan(date: Date) {
    const iso = toIso(date);
    if (iso < danasIso) return;
    if (jedanDatum) {
      if (odabraniDatumi.includes(iso)) {
        onPromjena([]);
      } else {
        onPromjena([iso]);
      }
      return;
    }
    if (odabraniDatumi.includes(iso)) {
      onPromjena(odabraniDatumi.filter((d) => d !== iso));
    } else {
      onPromjena([...odabraniDatumi, iso]);
    }
  }

  // Representative summary color: first selected date's color, or primary
  const sumarBoja =
    odabraniDatumi.length > 0
      ? (dateColors?.[odabraniDatumi[0]] ?? 'var(--first-primary)')
      : 'var(--first-primary)';

  return (
    <div className="select-none">
      {/* Header - navigacija */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAktivan(new Date(godina, mjesec - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-soft-beige/40"
          style={{ color: 'var(--first-nonary)' }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--first-octonary)' }}
        >
          {MJESECI[mjesec]} {godina}
        </span>
        <button
          type="button"
          onClick={() => setAktivan(new Date(godina, mjesec + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-soft-beige/40"
          style={{ color: 'var(--first-nonary)' }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Zaglavlje dana u sedmici */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {DANI.map((d) => (
          <div
            key={d}
            className="py-1 text-xs font-semibold"
            style={{ color: 'var(--first-nonary)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid dana */}
      <div className="grid grid-cols-7 gap-0.5">
        {danovi.map((date, i) => {
          if (!date) return <div key={`p-${i}`} />;

          const iso = toIso(date);
          const jeOdabran = odabraniDatumi.includes(iso);
          const jeProslost = iso < danasIso;
          const jeDanas = iso === danasIso;
          const bojaOvogDana = dateColors?.[iso] ?? 'var(--first-primary)';

          return (
            <button
              key={iso}
              type="button"
              onClick={() => toggleDan(date)}
              disabled={jeProslost}
              className="flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium
                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                backgroundColor: jeOdabran
                  ? bojaOvogDana
                  : jeDanas
                    ? 'rgb(var(--first-quaternary-rgb) / 0.35)'
                    : 'transparent',
                color: jeOdabran
                  ? '#fff'
                  : jeProslost
                    ? 'rgb(var(--first-quinary-rgb) / 0.45)'
                    : 'var(--first-octonary)',
                fontWeight: jeOdabran ? 700 : jeDanas ? 600 : 400,
                cursor: jeProslost ? 'not-allowed' : 'pointer',
                boxShadow: jeOdabran ? `0 0 0 1px ${bojaOvogDana}80` : 'none',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Sumirani prikaz */}
      {odabraniDatumi.length > 0 && (
        <div
          className="mt-3 rounded-xl px-3 py-2 text-xs font-medium"
          style={{
            backgroundColor: `${sumarBoja}18`,
            border: `1px solid ${sumarBoja}40`,
            color: 'var(--first-octonary)',
          }}
        >
          {jedanDatum || odabraniDatumi.length === 1
            ? 'Odabran 1 datum'
            : `Odabrano ${odabraniDatumi.length} datuma`}
        </div>
      )}
    </div>
  );
}
