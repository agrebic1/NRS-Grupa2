'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Lock,
  AlertTriangle,
  X,
  Star,
  MessageSquare,
  Ban,
  XCircle,
  Calendar,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { Button } from '@/components/ui/Button';
import { DispecerZahtjevDetaljSadrzaj } from '@/components/dispecer/DispecerZahtjevDetaljSadrzaj';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { oznakaZaDispecerskiPrikazBroja } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { HistorijaAktivnostiSekcija } from '@/components/serviser/HistorijaAktivnostiSekcija';
import type { InterventionActivity } from '@/domain/types/servisirane';

type ZahtjevDetalj = ServisniZahtjev & {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
};

const STATUSI_ZA_ZATVARANJE = new Set(['dodijeljeno', 'u_radu', 'u_izvrsenju']);

function DispecerZahtjevDetaljSaUpitom({
  zahtjev,
  requestId,
  setZahtjev,
  setAktivnosti,
}: {
  zahtjev: ZahtjevDetalj;
  requestId: string;
  setZahtjev: (z: ZahtjevDetalj) => void;
  setAktivnosti: (a: InterventionActivity[]) => void;
}) {
  const searchParams = useSearchParams();
  const fokusKorakTermin = searchParams.get('korak') === 'termin';

  return (
    <DispecerZahtjevDetaljSadrzaj
      zahtjev={zahtjev}
      requestId={requestId}
      onRequestUpdated={(noviZahtjev) => setZahtjev(noviZahtjev)}
      onOsvjezajDetalj={({ zahtjev: z, aktivnosti: a }) => {
        setZahtjev(z);
        if (a) setAktivnosti(a);
      }}
      prikaziDugmeNazad
      hrefNazad={`/dispecer?z=${zahtjev.id}`}
      fokusKorakTermin={fokusKorakTermin}
    />
  );
}

function ZatvorIntervencijePanel({
  zahtjevId,
  onUspjeh,
}: {
  zahtjevId: number;
  onUspjeh: () => void;
}) {
  const [prikaziFormu, setPrikaziFormu] = useState(false);
  const [napomene, setNapomene] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function zatvori() {
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'zatvori',
          napomene: napomene.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri zatvaranju.');
      onUspjeh();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri zatvaranju.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="mt-6 rounded-2xl p-5"
      style={{
        backgroundColor: 'rgb(34 197 94 / 0.06)',
        border: '1px solid rgb(34 197 94 / 0.25)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgb(34 197 94 / 0.12)' }}
          >
            <CheckCircle2 className="h-5 w-5" style={{ color: '#22C55E' }} />
          </div>
          <div>
            <p
              className="font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Zatvori intervenciju
            </p>
            <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              Označi intervenciju kao završenu
            </p>
          </div>
        </div>
        {!prikaziFormu && (
          <Button size="sm" onClick={() => setPrikaziFormu(true)}>
            <CheckCircle2 className="h-4 w-4" />
            Zatvori
          </Button>
        )}
      </div>

      {prikaziFormu && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Napomena
              <span
                className="ml-1 font-normal"
                style={{ color: 'var(--first-nonary)' }}
              >
                (opciono)
              </span>
            </label>
            <textarea
              rows={2}
              value={napomene}
              onChange={(e) => setNapomene(e.target.value)}
              placeholder="Npr. Intervencija uspješno završena, serviser dostavlja izvještaj..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
                backgroundColor: 'rgb(255 255 255 / 0.9)',
                color: 'var(--first-octonary)',
              }}
            />
          </div>

          {greska && (
            <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
              {greska}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPrikaziFormu(false);
                setNapomene('');
                setGreska(null);
              }}
              disabled={jeSlanje}
            >
              <X className="h-4 w-4" />
              Odustani
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={zatvori}
              isLoading={jeSlanje}
              loadingText="Zatvaranje..."
            >
              <CheckCircle2 className="h-4 w-4" />
              Potvrdi zatvaranje
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ZatvoriFormalnoPanel({
  zahtjevId,
  imaEvidenciju,
  onUspjeh,
}: {
  zahtjevId: number;
  imaEvidenciju: boolean;
  onUspjeh: () => void;
}) {
  const [napomene, setNapomene] = useState('');
  const [potvrdjeno, setPotvrdjeno] = useState(false);
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function zatvori() {
    if (!potvrdjeno) return;
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'zatvoriFormalno',
          closure_note: napomene.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri zatvaranju.');
      onUspjeh();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="mt-6 rounded-2xl overflow-hidden"
      style={{
        border: '2px solid rgb(var(--first-primary-rgb)/0.25)',
        backgroundColor: 'rgb(255 255 255/0.95)',
      }}
    >
      <div
        className="px-5 py-4"
        style={{ backgroundColor: 'var(--first-primary)' }}
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-white" />
          <p className="text-sm font-bold text-white">
            Formalno zatvaranje intervencije
          </p>
        </div>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Serviser je završio intervenciju. Pregledajte evidenciju i formalno
          zatvorite.
        </p>
      </div>
      <div className="p-5 flex flex-col gap-4">
        {!imaEvidenciju && (
          <div
            className="flex items-start gap-2 rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(220,38,38,0.05)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              style={{ color: '#DC2626' }}
            />
            <p className="text-sm" style={{ color: '#DC2626' }}>
              Zatvaranje nije moguće - serviser još nije evidentirao obavljeni
              rad.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Napomena pri zatvaranju
            <span
              className="ml-1 font-normal"
              style={{ color: 'var(--first-nonary)' }}
            >
              (opciono)
            </span>
          </label>
          <textarea
            rows={3}
            value={napomene}
            onChange={(e) => setNapomene(e.target.value)}
            disabled={!imaEvidenciju}
            placeholder="Eventualne napomene za arhiv..."
            className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
              color: 'var(--first-octonary)',
            }}
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={potvrdjeno}
            onChange={(e) => setPotvrdjeno(e.target.checked)}
            disabled={!imaEvidenciju}
            className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded"
          />
          <p
            className="text-sm font-semibold leading-relaxed"
            style={{ color: 'var(--first-octonary)' }}
          >
            Potvrđujem da je intervencija pregledana i da je obavljeni posao
            dokumentovan.
          </p>
        </label>
        {greska && (
          <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {greska}
          </p>
        )}
        <button
          type="button"
          onClick={zatvori}
          disabled={!potvrdjeno || !imaEvidenciju || jeSlanje}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
        >
          <Lock className="h-4 w-4" />
          {jeSlanje ? 'Zatvaranje...' : 'Zatvori intervenciju'}
        </button>
      </div>
    </div>
  );
}

// ─── Sažetak završene intervencije (umjesto wizarda za terminalne statuse) ────

function SazetakZavrseneDispecer({
  zahtjev,
  evidencije,
}: {
  zahtjev: any;
  evidencije: unknown[];
}) {
  const status: string = zahtjev.status;

  if (status === 'zavrseno') {
    return (
      <div
        className="mb-6 rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(34,197,94,0.3)',
          backgroundColor: 'rgb(255 255 255/0.95)',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            backgroundColor: 'rgba(34,197,94,0.07)',
            borderBottom: '1px solid rgba(34,197,94,0.15)',
          }}
        >
          <CheckCircle2
            className="h-5 w-5 flex-shrink-0"
            style={{ color: '#16A34A' }}
          />
          <div>
            <p className="font-bold" style={{ color: '#166534' }}>
              Serviser završio intervenciju
            </p>
            <p className="text-xs" style={{ color: '#15803D' }}>
              Čeka formalno zatvaranje dispečera
            </p>
          </div>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          {evidencije.length > 0 ? (
            <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
              Evidentirano {evidencije.length}{' '}
              {evidencije.length === 1
                ? 'zapis'
                : evidencije.length < 5
                  ? 'zapisa'
                  : 'zapisa'}{' '}
              rada. Pregledajte evidenciju ispod i formalno zatvorite
              intervenciju.
            </p>
          ) : (
            <div
              className="flex items-start gap-2 rounded-xl p-3"
              style={{
                backgroundColor: 'rgba(220,38,38,0.05)',
                border: '1px solid rgba(220,38,38,0.18)',
              }}
            >
              <AlertTriangle
                className="h-4 w-4 flex-shrink-0 mt-0.5"
                style={{ color: '#DC2626' }}
              />
              <p className="text-sm" style={{ color: '#DC2626' }}>
                Serviser nije evidentirao obavljeni rad. Zatvaranje nije moguće
                dok evidencija nije dodata.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'zatvoreno') {
    return (
      <div
        className="mb-6 rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
          backgroundColor: 'rgb(255 255 255/0.95)',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.4)',
            borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
          }}
        >
          <Lock
            className="h-5 w-5 flex-shrink-0"
            style={{ color: 'var(--first-secondary)' }}
          />
          <div>
            <p className="font-bold" style={{ color: 'var(--first-octonary)' }}>
              Intervencija formalno zatvorena
            </p>
            {zahtjev.closed_at && (
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                {new Date(zahtjev.closed_at).toLocaleDateString('bs-BA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
        {zahtjev.closure_note && (
          <div className="px-5 py-4">
            <div className="flex items-start gap-2 mb-1.5">
              <FileText
                className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--first-nonary)' }}
              />
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Napomena pri zatvaranju
              </p>
            </div>
            <p
              className="text-sm leading-relaxed rounded-xl border-l-4 py-2 pl-3 pr-4"
              style={{
                borderLeftColor: 'var(--first-secondary)',
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
                color: 'var(--first-octonary)',
              }}
            >
              {zahtjev.closure_note}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (status === 'otkazano') {
    return (
      <div
        className="mb-6 rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(100,116,139,0.3)',
          backgroundColor: 'rgb(255 255 255/0.95)',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            backgroundColor: 'rgba(100,116,139,0.06)',
            borderBottom: '1px solid rgba(100,116,139,0.15)',
          }}
        >
          <Ban className="h-5 w-5 flex-shrink-0" style={{ color: '#64748B' }} />
          <div>
            <p className="font-bold" style={{ color: '#334155' }}>
              Zahtjev otkazan
            </p>
            <p className="text-xs" style={{ color: '#64748B' }}>
              {zahtjev.updated_at
                ? new Date(zahtjev.updated_at).toLocaleDateString('bs-BA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Datum otkazivanja nije dostupan'}
            </p>
          </div>
        </div>
        {zahtjev.cancel_reason && (
          <div className="px-5 py-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--first-octonary)' }}
            >
              <span className="font-semibold">Razlog: </span>
              {zahtjev.cancel_reason}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (status === 'odbijeno') {
    return (
      <div
        className="mb-6 rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(220,38,38,0.25)',
          backgroundColor: 'rgb(255 255 255/0.95)',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            backgroundColor: 'rgba(220,38,38,0.05)',
            borderBottom: '1px solid rgba(220,38,38,0.12)',
          }}
        >
          <XCircle
            className="h-5 w-5 flex-shrink-0"
            style={{ color: '#DC2626' }}
          />
          <div>
            <p className="font-bold" style={{ color: '#991B1B' }}>
              Zahtjev odbijen
            </p>
            <p className="text-xs" style={{ color: '#DC2626' }}>
              {zahtjev.updated_at
                ? new Date(zahtjev.updated_at).toLocaleDateString('bs-BA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </p>
          </div>
        </div>
        {zahtjev.dispecer_napomene && (
          <div className="px-5 py-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--first-octonary)' }}
            >
              <span className="font-semibold">Napomena: </span>
              {zahtjev.dispecer_napomene}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─── Ocjena korisnika — read-only prikaz za dispečera ────────────────────────

interface OcjenaPodaci {
  id: number;
  ocjena: number;
  komentar: string | null;
  created_at: string;
}

function OcjenaDispecerPregled({ zahtjevId }: { zahtjevId: number }) {
  const [ocjena, setOcjena] = useState<OcjenaPodaci | null | undefined>(
    undefined,
  );

  useEffect(() => {
    fetch(`/api/service-requests/${zahtjevId}/ocjena`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setOcjena(d.ocjena ?? null))
      .catch(() => setOcjena(null));
  }, [zahtjevId]);

  if (ocjena === undefined) return null;

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl"
      style={{
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
        backgroundColor: 'rgb(255 255 255/0.9)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
          background:
            'linear-gradient(135deg, rgba(234,179,8,0.07) 0%, transparent 100%)',
        }}
      >
        <Star className="h-3.5 w-3.5" style={{ color: '#CA8A04' }} />
        <p
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: '#92400E' }}
        >
          Ocjena korisnika
        </p>
      </div>

      {ocjena === null ? (
        <p
          className="px-4 py-4 text-sm"
          style={{ color: 'var(--first-nonary)' }}
        >
          Korisnik još nije ostavio ocjenu.
        </p>
      ) : (
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="h-5 w-5"
                  strokeWidth={1.5}
                  fill={n <= ocjena.ocjena ? '#FBBF24' : 'transparent'}
                  style={{
                    color:
                      n <= ocjena.ocjena
                        ? '#FBBF24'
                        : 'rgb(var(--first-quaternary-rgb)/0.4)',
                  }}
                />
              ))}
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: 'var(--first-octonary)' }}
            >
              {ocjena.ocjena}/5
            </span>
            <span className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              {new Date(ocjena.created_at).toLocaleDateString('bs-BA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          {ocjena.komentar && (
            <div
              className="flex items-start gap-2 rounded-xl px-3.5 py-3"
              style={{
                backgroundColor: 'rgba(234,179,8,0.05)',
                border: '1px solid rgba(234,179,8,0.2)',
              }}
            >
              <MessageSquare
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ color: '#CA8A04' }}
              />
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: 'var(--first-octonary)' }}
              >
                &ldquo;{ocjena.komentar}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Glavna stranica ──────────────────────────────────────────────────────────

export default function DispecerZahtjevDetaljPage() {
  const { id } = useParams<{ id: string }>();
  const [zahtjev, setZahtjev] = useState<ZahtjevDetalj | null>(null);
  const [evidencije, setEvidencije] = useState<unknown[]>([]);
  const [aktivnosti, setAktivnosti] = useState<InterventionActivity[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);

  async function ucitaj() {
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${id}`, {
        cache: 'no-store',
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Zahtjev nije pronađen.');
      setZahtjev(d.zahtjev);
      setEvidencije(d.evidencije ?? []);
      setAktivnosti(d.aktivnosti ?? []);
    } catch (err) {
      setGreska(
        err instanceof Error ? err.message : 'Greška pri učitavanju podataka.',
      );
    } finally {
      setUcitava(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void ucitaj();
  }, [id]);

  const kategorija = zahtjev ? labelKategorije(zahtjev) : null;
  const naslovStr =
    zahtjev && kategorija
      ? `${kategorija.podkategorija || kategorija.glavna}`
      : 'Obrada zahtjeva';

  return (
    <AppShell uloga="dispecer" imeKorisnika="Dispečer">
      <div className="mx-auto max-w-6xl px-4 sm:px-0">
        {/* Header: nazad + breadcrumb + naslov + badge */}
        <div className="mb-5">
          <div
            className="mb-3 flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            <Link
              href={zahtjev ? `/dispecer?z=${zahtjev.id}` : '/dispecer'}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-all hover:bg-black/[0.04]"
              style={{ color: 'var(--first-secondary)' }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kontrolna ploča
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href="/dispecer/zahtjevi"
              className="rounded-lg px-2 py-1 font-medium transition-all hover:bg-black/[0.04]"
              style={{ color: 'var(--first-secondary)' }}
            >
              Zahtjevi
            </Link>
            {zahtjev && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span
                  className="font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  #{oznakaZaDispecerskiPrikazBroja(zahtjev)}
                </span>
              </>
            )}
          </div>
          {zahtjev && (
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-xl font-black"
                style={{ color: 'var(--first-octonary)' }}
              >
                {naslovStr}
              </h1>
              {kategorija?.podkategorija && (
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  {kategorija.glavna}
                </span>
              )}
              {zahtjev.is_premium && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: 'rgba(220,38,38,0.1)',
                    color: '#DC2626',
                    border: '1.5px solid rgba(220,38,38,0.25)',
                  }}
                >
                  Premium
                </span>
              )}
              {zahtjev.final_priority && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: 'rgba(220,38,38,0.08)',
                    color:
                      zahtjev.final_priority === 'HITNO' ||
                      zahtjev.final_priority === 'KRITIČNO'
                        ? '#DC2626'
                        : 'var(--first-secondary)',
                    border: '1px solid rgba(220,38,38,0.2)',
                  }}
                >
                  {zahtjev.final_priority}
                </span>
              )}
            </div>
          )}
        </div>

        {ucitava && (
          <div className="flex items-center gap-3 py-12">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Učitavanje zahtjeva...
            </p>
          </div>
        )}
        {greska && <AlertMessage variant="error" message={greska} />}

        {zahtjev &&
          (() => {
            const terminalni = new Set([
              'zavrseno',
              'zatvoreno',
              'otkazano',
              'odbijeno',
            ]);
            const jeTerminalni = terminalni.has(zahtjev.status);
            return (
              <>
                <HistorijaAktivnostiSekcija
                  aktivnosti={aktivnosti}
                  ucitava={ucitava}
                  className="mb-6"
                />

                {jeTerminalni ? (
                  <SazetakZavrseneDispecer
                    zahtjev={zahtjev}
                    evidencije={evidencije}
                  />
                ) : (
                  <Suspense fallback={null}>
                    <DispecerZahtjevDetaljSaUpitom
                      zahtjev={zahtjev}
                      requestId={String(id)}
                      setZahtjev={setZahtjev}
                      setAktivnosti={setAktivnosti}
                    />
                  </Suspense>
                )}

                {STATUSI_ZA_ZATVARANJE.has(zahtjev.status) && (
                  <ZatvorIntervencijePanel
                    zahtjevId={zahtjev.id}
                    onUspjeh={ucitaj}
                  />
                )}

                {zahtjev.status === 'zavrseno' &&
                  !(zahtjev as any).closed_at && (
                    <ZatvoriFormalnoPanel
                      zahtjevId={zahtjev.id}
                      imaEvidenciju={evidencije.length > 0}
                      onUspjeh={ucitaj}
                    />
                  )}

                {zahtjev.status === 'zatvoreno' && (
                  <OcjenaDispecerPregled zahtjevId={zahtjev.id} />
                )}
              </>
            );
          })()}
      </div>
    </AppShell>
  );
}
