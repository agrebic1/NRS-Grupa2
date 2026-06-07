'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, History, Star, Calendar,
  MapPin, CheckCircle2, XCircle, Ban, Clock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { statusBoja, statusOznaka } from '@/lib/servisirane/statusBoja';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import type { ServisniZahtjev } from '@/domain/types/servisirane';

// ─── Tipovi ───────────────────────────────────────────────────────────────────

interface ZahtjevHistorije extends ServisniZahtjev {
  korisnicki_broj_zahtjeva?: number | null;
  ocjena: { ocjena: number; komentar: string | null } | null;
}

// ─── Grupiranje po periodu ────────────────────────────────────────────────────

function periodnaNaziv(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', { year: 'numeric', month: 'long' });
}

function grupirajPoPerioду(zahtjevi: ZahtjevHistorije[]): [string, ZahtjevHistorije[]][] {
  const mapa = new Map<string, ZahtjevHistorije[]>();
  for (const z of zahtjevi) {
    const kljuc = periodnaNaziv(z.created_at);
    if (!mapa.has(kljuc)) mapa.set(kljuc, []);
    mapa.get(kljuc)!.push(z);
  }
  return Array.from(mapa.entries());
}

// ─── Zvjezdice ────────────────────────────────────────────────────────────────

function MiniZvjezdice({ vrijednost }: { vrijednost: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Ocjena: ${vrijednost} od 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-3 w-3"
          strokeWidth={1.5}
          fill={n <= vrijednost ? 'var(--first-senary)' : 'transparent'}
          style={{ color: n <= vrijednost ? 'var(--first-senary)' : 'rgb(var(--first-quaternary-rgb)/0.5)' }}
        />
      ))}
    </span>
  );
}

// ─── Status ikona ─────────────────────────────────────────────────────────────

function StatusIkona({ status }: { status: string }) {
  const props = { className: 'h-4 w-4 flex-shrink-0', style: { color: statusBoja(status) } };
  if (status === 'zatvoreno' || status === 'zavrseno') return <CheckCircle2 {...props} />;
  if (status === 'otkazano')  return <XCircle {...props} />;
  if (status === 'odbijeno')  return <Ban {...props} />;
  return <Clock {...props} />;
}

// ─── Kartica historijske intervencije ─────────────────────────────────────────

function HistorijaKartica({ zahtjev }: { zahtjev: ZahtjevHistorije }) {
  const kat   = labelKategorije(zahtjev);
  const naziv = kat.podkategorija ? `${kat.podkategorija}` : kat.glavna;
  const sboja = statusBoja(zahtjev.status);

  return (
    <Link
      href={`/korisnik/zahtjevi/${zahtjev.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--first-secondary-rgb)/0.4)]"
      style={{
        backgroundColor: 'rgb(255 255 255 / 0.8)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        borderLeftWidth: 4,
        borderLeftColor: sboja,
      }}
    >
      <div className="px-5 py-4">
        {/* Zaglavlje */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.2)', color: 'var(--first-nonary)' }}
              >
                #{zahtjev.korisnicki_broj_zahtjeva ?? zahtjev.id}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: `${sboja}14`, color: sboja, border: `1px solid ${sboja}28` }}
              >
                <StatusIkona status={zahtjev.status} />
                {statusOznaka(zahtjev.status)}
              </span>
            </div>
            <p className="truncate text-sm font-bold" style={{ color: 'var(--first-octonary)' }}>
              {naziv}
            </p>
            {kat.podkategorija && (
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>{kat.glavna}</p>
            )}
          </div>
          <ChevronRight
            className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: 'var(--first-nonary)' }}
          />
        </div>

        {/* Meta informacije */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs" style={{ color: 'var(--first-nonary)' }}>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {formatirajDatumPrikaz(zahtjev.created_at, '-')}
          </span>
          {zahtjev.address && (
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[180px]">{zahtjev.address}</span>
            </span>
          )}
        </div>

        {/* Ocjena */}
        {zahtjev.ocjena ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: 'rgba(217,132,0,0.06)', border: '1px solid rgba(217,132,0,0.2)' }}>
            <MiniZvjezdice vrijednost={zahtjev.ocjena.ocjena} />
            {zahtjev.ocjena.komentar && (
              <p className="min-w-0 truncate text-xs italic" style={{ color: 'var(--first-nonary)' }}>
                {`"${zahtjev.ocjena.komentar}"`}
              </p>
            )}
          </div>
        ) : zahtjev.status === 'zatvoreno' ? (
          <p className="mt-2 text-xs" style={{ color: 'var(--first-nonary)' }}>
            Niste ocijenili ovu intervenciju — otvorite da dodate ocjenu
          </p>
        ) : null}
      </div>
    </Link>
  );
}

// ─── Period header ────────────────────────────────────────────────────────────

function PeriodHeader({ naziv, broj }: { naziv: string; broj: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--first-nonary)' }} />
        <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>
          {naziv}
        </h2>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.2)', color: 'var(--first-nonary)' }}
      >
        {broj}
      </span>
      <div className="flex-1 border-b" style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }} />
    </div>
  );
}

// ─── Prazno stanje ────────────────────────────────────────────────────────────

function PraznoStanje() {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
        border: '1px dashed rgb(var(--first-quaternary-rgb) / 0.4)',
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.1)' }}
      >
        <History className="h-7 w-7" style={{ color: 'var(--first-secondary)' }} />
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: 'var(--first-octonary)' }}>
          Nema prethodnih intervencija
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
          Vaše završene, zatvorene, otkazane ili odbijene intervencije će se prikazati ovdje.
        </p>
      </div>
      <Link
        href="/korisnik/zahtjevi/novi"
        className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
        style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
      >
        Pošalji novi zahtjev
      </Link>
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function HistorijaPage() {
  const [historija, setHistorija] = useState<ZahtjevHistorije[]>([]);
  const [ucitava,   setUcitava]   = useState(true);
  const [greska,    setGreska]    = useState<string | null>(null);

  useEffect(() => {
    let aktivan = true;
    (async () => {
      try {
        const r = await fetch('/api/service-requests/historija', { cache: 'no-store' });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
        if (aktivan) setHistorija(d.historija ?? []);
      } catch (err) {
        if (aktivan) setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju historije.');
      } finally {
        if (aktivan) setUcitava(false);
      }
    })();
    return () => { aktivan = false; };
  }, []);

  const grupe = grupirajPoPerioду(historija);

  return (
    <AppShell uloga="korisnik">
      <div className="mx-auto max-w-2xl">
        {/* Zaglavlje */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/korisnik"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2"
            aria-label="Nazad na pregled"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)' }}
            >
              <History style={{ color: 'var(--first-secondary)', width: '1.125rem', height: '1.125rem' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
                Historija intervencija
              </h1>
              {!ucitava && historija.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  {historija.length} {historija.length === 1 ? 'intervencija' : 'intervencija'} u {grupe.length} {grupe.length === 1 ? 'periodu' : 'perioda'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stanja */}
        {ucitava && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'var(--first-secondary)' }}
              />
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje historije...</p>
            </div>
          </div>
        )}

        {!ucitava && greska && (
          <AlertMessage variant="error" message={greska} />
        )}

        {!ucitava && !greska && historija.length === 0 && (
          <PraznoStanje />
        )}

        {/* Timeline grupiran po periodu */}
        {!ucitava && !greska && grupe.length > 0 && (
          <div className="flex flex-col gap-6">
            {grupe.map(([period, zahtjevi]) => (
              <div key={period} className="flex flex-col gap-3">
                <PeriodHeader naziv={period} broj={zahtjevi.length} />
                {zahtjevi.map((z) => (
                  <HistorijaKartica key={z.id} zahtjev={z} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
