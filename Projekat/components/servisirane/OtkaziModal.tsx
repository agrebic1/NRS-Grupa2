'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const RAZLOZI = [
  'Kvar je riješen na drugi način',
  'Pogrešno prijavljen kvar',
  'Promjena planova',
  'Nije hitno - odgađam',
  'Drugo',
] as const;

interface OtkaziModalProps {
  zahtjevId:  number;
  /** Redni broj zahtjeva korisnika (prikaz); ako nije proslijeđen, ne prikazuje se. */
  korisnickiBrojZahtjeva?: number;
  kategorija: string;
  onZatvori: () => void;
  onUspjeh:  () => void;
}

export function OtkaziModal({
  zahtjevId,
  korisnickiBrojZahtjeva,
  kategorija,
  onZatvori,
  onUspjeh,
}: OtkaziModalProps) {
  const [odabranRazlog, setOdabranRazlog] = useState<string>('');
  const [drugoTekst,    setDrugoTekst]    = useState('');
  const [jeSlanje,      setJeSlanje]      = useState(false);
  const [greska,        setGreska]        = useState<string | null>(null);

  const razlog = odabranRazlog === 'Drugo' ? drugoTekst.trim() : odabranRazlog;
  const mozePoslati = razlog.length >= 1 && (odabranRazlog !== 'Drugo' || drugoTekst.trim().length >= 3);

  async function potvrdiOtkazivanje() {
    if (!mozePoslati) {
      setGreska('Odaberite razlog otkazivanja.');
      return;
    }
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/service-requests/${zahtjevId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'cancel', cancel_reason: razlog }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri otkazivanju.');
      onUspjeh();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri otkazivanju.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onZatvori(); }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
        }}
      >
        {/* Zaglavlje */}
        <div
          className="flex items-start justify-between border-b px-6 py-4"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--first-octonary)' }}>
                Otkazivanje zahtjeva
              </h2>
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                {typeof korisnickiBrojZahtjeva === 'number'
                  ? `Zahtjev #${korisnickiBrojZahtjeva} · ${kategorija}`
                  : kategorija}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onZatvori}
            className="transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-nonary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tijelo */}
        <div className="px-6 py-5">
          <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
            Da li ste sigurni da želite otkazati ovaj zahtjev?{' '}
            <strong style={{ color: 'var(--first-octonary)' }}>Ova akcija se ne može poništiti.</strong>
            {' '}Zahtjev ostaje u vašoj historiji.
          </p>

          {/* Razlozi */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>
              Razlog otkazivanja
            </p>
            {RAZLOZI.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5
                  transition-all duration-150"
                style={{
                  borderColor:     odabranRazlog === r ? 'rgba(220,38,38,0.4)' : 'rgb(var(--first-quaternary-rgb) / 0.35)',
                  backgroundColor: odabranRazlog === r ? 'rgba(220,38,38,0.04)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="razlog"
                  value={r}
                  checked={odabranRazlog === r}
                  onChange={() => setOdabranRazlog(r)}
                  className="sr-only"
                />
                <div
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor:     odabranRazlog === r ? '#DC2626' : 'rgb(var(--first-quaternary-rgb) / 0.5)',
                    backgroundColor: odabranRazlog === r ? '#DC2626' : 'transparent',
                  }}
                >
                  {odabranRazlog === r && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--first-octonary)' }}>
                  {r}
                </span>
              </label>
            ))}

            {/* Custom razlog */}
            {odabranRazlog === 'Drugo' && (
              <textarea
                rows={2}
                placeholder="Opišite razlog (min. 3 karaktera)..."
                value={drugoTekst}
                onChange={(e) => setDrugoTekst(e.target.value)}
                className="mt-1 w-full resize-none rounded-xl border px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2"
                style={{
                  borderColor:     'rgb(var(--first-quaternary-rgb) / 0.4)',
                  backgroundColor: 'rgb(255 255 255 / 0.7)',
                  color:           'var(--first-octonary)',
                }}
              />
            )}
          </div>

          {greska && (
            <p className="mt-3 text-xs font-medium" style={{ color: '#DC2626' }}>
              {greska}
            </p>
          )}
        </div>

        {/* Akcije */}
        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onZatvori}
            disabled={jeSlanje}
          >
            Odustani
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={potvrdiOtkazivanje}
            isLoading={jeSlanje}
            loadingText="Otkazivanje..."
            disabled={!mozePoslati}
          >
            <AlertTriangle className="h-4 w-4" />
            Otkaži zahtjev
          </Button>
        </div>
      </div>
    </div>
  );
}
