'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { IntervencijaOcjena } from '@/domain/types/servisirane';
import { fmtDatumKratki } from '@/lib/format/datumi';

// ─── Prikaz zvjezdica ─────────────────────────────────────────────────────────

function Zvjezdice({
  vrijednost,
  interaktivno,
  hover,
  onHover,
  onClick,
}: {
  vrijednost: number;
  interaktivno: boolean;
  hover: number;
  onHover: (n: number) => void;
  onClick: (n: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role={interaktivno ? 'radiogroup' : undefined}
      aria-label="Ocjena"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const popunjeno = interaktivno
          ? n <= (hover || vrijednost)
          : n <= vrijednost;
        return (
          <button
            key={n}
            type="button"
            role={interaktivno ? 'radio' : undefined}
            aria-checked={interaktivno ? n === vrijednost : undefined}
            aria-label={`${n} od 5`}
            disabled={!interaktivno}
            onClick={() => interaktivno && onClick(n)}
            onMouseEnter={() => interaktivno && onHover(n)}
            onMouseLeave={() => interaktivno && onHover(0)}
            className="transition-transform duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-sm disabled:cursor-default"
            style={{
              transform:
                interaktivno && hover === n ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Star
              className="h-7 w-7"
              strokeWidth={1.5}
              fill={popunjeno ? 'var(--first-senary)' : 'transparent'}
              style={{
                color: popunjeno
                  ? 'var(--first-senary)'
                  : 'rgb(var(--first-quaternary-rgb)/0.6)',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Oznake ocjena ────────────────────────────────────────────────────────────

const OZNAKE_OCJENA: Record<number, string> = {
  1: 'Veoma loše',
  2: 'Loše',
  3: 'Prosječno',
  4: 'Dobro',
  5: 'Odlično',
};

// ─── Komponenta ───────────────────────────────────────────────────────────────

interface OcjenaIntervencijeProps {
  zahtjevId: number;
}

export function OcjenaIntervencije({ zahtjevId }: OcjenaIntervencijeProps) {
  const [ocjena, setOcjena] = useState<IntervencijaOcjena | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [odabranaOc, setOdabranaOc] = useState(0);
  const [hoverOc, setHoverOc] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [uspjeh, setUspjeh] = useState(false);

  useEffect(() => {
    let aktivan = true;
    (async () => {
      try {
        const r = await fetch(`/api/service-requests/${zahtjevId}/ocjena`, {
          cache: 'no-store',
        });
        const d = await r.json();
        if (aktivan && r.ok) setOcjena(d.ocjena ?? null);
      } finally {
        if (aktivan) setUcitava(false);
      }
    })();
    return () => {
      aktivan = false;
    };
  }, [zahtjevId]);

  async function posaljiOcjenu() {
    if (odabranaOc === 0) {
      setGreska('Odaberite ocjenu.');
      return;
    }
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/service-requests/${zahtjevId}/ocjena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocjena: odabranaOc,
          komentar: komentar.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri slanju ocjene.');
      setOcjena(d.ocjena);
      setUspjeh(true);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri slanju.');
    } finally {
      setJeSlanje(false);
    }
  }

  if (ucitava) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2
          className="h-4 w-4 animate-spin"
          style={{ color: 'var(--first-nonary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--first-nonary)' }}>
          Učitavanje ocjene...
        </span>
      </div>
    );
  }

  // Read-only: ocjena već postoji
  if (ocjena) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Zvjezdice
            vrijednost={ocjena.ocjena}
            interaktivno={false}
            hover={0}
            onHover={() => {}}
            onClick={() => {}}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            {OZNAKE_OCJENA[ocjena.ocjena] ?? `${ocjena.ocjena}/5`}
          </span>
        </div>
        {ocjena.komentar && (
          <div
            className="flex gap-2 rounded-xl border-l-4 px-4 py-3"
            style={{
              borderLeftColor: 'var(--first-secondary)',
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.04)',
            }}
          >
            <MessageSquare
              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
              style={{ color: 'var(--first-nonary)' }}
            />
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: 'var(--first-octonary)' }}
            >
              {`"${ocjena.komentar}"`}
            </p>
          </div>
        )}
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          Ocijenjeno {fmtDatumKratki(ocjena.created_at)}
        </p>
      </div>
    );
  }

  // Forma za unos ocjene
  return (
    <div className="flex flex-col gap-4">
      {uspjeh ? (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <Check
            className="h-4 w-4 flex-shrink-0"
            style={{ color: '#16A34A' }}
          />
          <p className="text-sm font-medium" style={{ color: '#16A34A' }}>
            Hvala na ocjeni! Vaša povratna informacija pomaže nam unaprijediti
            uslugu.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Ocijenite kvalitet usluge od 1 (loše) do 5 (odlično):
            </p>
            <div className="flex items-center gap-3">
              <Zvjezdice
                vrijednost={odabranaOc}
                interaktivno
                hover={hoverOc}
                onHover={setHoverOc}
                onClick={(n) => {
                  setOdabranaOc(n);
                  setGreska(null);
                }}
              />
              {(hoverOc > 0 || odabranaOc > 0) && (
                <span
                  className="text-sm font-semibold transition-all"
                  style={{ color: 'var(--first-senary)' }}
                >
                  {OZNAKE_OCJENA[hoverOc || odabranaOc]}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`komentar-ocjena-${zahtjevId}`}
              className="text-xs font-medium"
              style={{ color: 'var(--first-nonary)' }}
            >
              Komentar (opcionalno)
            </label>
            <textarea
              id={`komentar-ocjena-${zahtjevId}`}
              rows={3}
              maxLength={1000}
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Podijelite iskustvo s radom servisnog tima..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                color: 'var(--first-octonary)',
                backgroundColor: 'rgb(255 255 255/0.9)',
              }}
            />
            <p
              className="text-right text-xs"
              style={{ color: 'var(--first-nonary)' }}
            >
              {komentar.length}/1000
            </p>
          </div>

          {greska && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                backgroundColor: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              <AlertTriangle
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: '#DC2626' }}
              />
              <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                {greska}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={posaljiOcjenu}
            disabled={jeSlanje || odabranaOc === 0}
            className="flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            {jeSlanje ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            {jeSlanje ? 'Slanje...' : 'Pošalji ocjenu'}
          </button>
        </>
      )}
    </div>
  );
}
