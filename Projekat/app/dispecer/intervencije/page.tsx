'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, CheckCircle2, Clock, MapPin, User,
  RefreshCw, Calendar, Zap, Truck, ChevronRight, ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { IntervencijaWorkflowProgress } from '@/components/dispecer/IntervencijaWorkflowProgress';
import { prioritetBoja, statusBoja, statusOznaka } from '@/lib/servisirane/statusBoja';
import { SlaStatusBadge } from '@/components/dispecer/SlaStatusBadge';
import { getSlaStatus } from '@/lib/servisirane/slaPravila';

// ─── Tipovi ───────────────────────────────────────────────────────────────────

interface IntervencijaRed extends ServisniZahtjev {
  podnosilac: { ime: string; prezime: string; broj_telefona: string | null } | null;
  serviser?:  { id: string; ime: string; prezime: string } | null;
}

type KpiFilter = 'sve' | 'hitno' | 'u_izvrsenju' | 'u_radu' | 'dodijeljeno' | 'kasni' | 'zavrseno' | 'sla';

// ─── Helperi ──────────────────────────────────────────────────────────────────

function jeHitna(z: IntervencijaRed): boolean {
  return (z.urgency_score ?? 0) >= 75 || Boolean(z.is_premium);
}

function jeKasni(z: IntervencijaRed): boolean {
  if (!z.termin_planirani_pocetak) return false;
  if (['zavrseno', 'otkazano', 'odbijeno'].includes(z.status)) return false;
  return new Date(z.termin_planirani_pocetak) < new Date();
}


function filtrirajPoKpi(intervencije: IntervencijaRed[], filter: KpiFilter): IntervencijaRed[] {
  switch (filter) {
    case 'hitno':       return intervencije.filter(jeHitna);
    case 'u_izvrsenju': return intervencije.filter((z) => z.status === 'u_izvrsenju');
    case 'u_radu':      return intervencije.filter((z) => z.status === 'u_radu');
    case 'dodijeljeno': return intervencije.filter((z) => z.status === 'dodijeljeno');
    case 'kasni':       return intervencije.filter(jeKasni);
    case 'zavrseno':    return intervencije.filter((z) => z.status === 'zavrseno' && !(z as any).closed_at);
    case 'sla':         return intervencije.filter((z) => getSlaStatus(z.created_at, z.final_priority, z.status) === 'prekoraceno');
    default:            return intervencije;
  }
}

// ─── KPI kartica ──────────────────────────────────────────────────────────────

function KpiKartica({
  oznaka, vrijednost, boja, Ikona, aktivan, onClick,
}: {
  oznaka:     string;
  vrijednost: number;
  boja:       string;
  Ikona:      React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  aktivan:    boolean;
  onClick:    () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: aktivan
          ? `color-mix(in srgb, ${boja} 14%, white)`
          : 'rgb(var(--first-quinary-rgb) / 0.22)',
        border: aktivan
          ? `2px solid color-mix(in srgb, ${boja} 45%, transparent)`
          : '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${boja} 14%, transparent)` }}
      >
        <Ikona className="h-4 w-4" style={{ color: boja }} />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums leading-none" style={{ color: aktivan ? boja : 'var(--first-octonary)' }}>
          {vrijednost}
        </p>
        <p className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--first-nonary)' }}>
          {oznaka}
        </p>
      </div>
    </button>
  );
}

// ─── Operativna kartica intervencije ──────────────────────────────────────────

function IntervencijaKartica({ z }: { z: IntervencijaRed }) {
  const kat    = labelKategorije(z);
  const naslov = kat.podkategorija ? `${kat.podkategorija}` : kat.glavna;
  const hitna  = jeHitna(z);
  const kasni  = jeKasni(z);
  const pboja  = prioritetBoja(z.final_priority);
  const sboja  = statusBoja(z.status);

  const terminStr = z.termin_planirani_pocetak
    ? new Date(z.termin_planirani_pocetak).toLocaleString('bs-BA', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <li>
      <Link
        href={`/dispecer/intervencije/${z.id}`}
        className="group flex min-w-0 items-stretch gap-0 overflow-hidden rounded-2xl transition-all duration-150 hover:shadow-md"
        style={{
          backgroundColor: 'rgb(255 255 255 / 0.8)',
          border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
        }}
      >
        {/* Prioritetna traka s lijeve strane */}
        <div
          className="w-1.5 flex-shrink-0 rounded-l-2xl"
          style={{ backgroundColor: hitna ? '#DC2626' : pboja }}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-4">
          {/* Red 1: ID + naslov + status + prioritet */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span
                className="text-[11px] font-bold tabular-nums"
                style={{ color: 'var(--first-nonary)' }}
              >
                #{z.id}
              </span>
              <span
                className="font-semibold leading-snug"
                style={{ color: 'var(--first-octonary)' }}
              >
                {naslov}
              </span>
              {hitna && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)' }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {z.is_premium ? 'Premium' : 'Hitno'}
                </span>
              )}
            </div>
            {/* Badges desno */}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {kasni && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <Clock className="h-2.5 w-2.5" />
                  Kasni
                </span>
              )}
              <SlaStatusBadge
                createdAt={z.created_at}
                prioritet={z.final_priority}
                status={z.status}
                prikaziVrijeme
              />
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${sboja} 12%, transparent)`, color: sboja, border: `1px solid color-mix(in srgb, ${sboja} 30%, transparent)` }}
              >
                {statusOznaka(z.status)}
              </span>
              {z.final_priority && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: `color-mix(in srgb, ${pboja} 10%, transparent)`, color: pboja }}
                >
                  {z.final_priority}
                </span>
              )}
            </div>
          </div>

          {/* Workflow progress */}
          <IntervencijaWorkflowProgress status={z.status} />

          {/* Red 3: meta podaci */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1 max-w-[18rem]">{z.address}</span>
            </span>
            {z.serviser ? (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                {z.serviser.ime} {z.serviser.prezime}
              </span>
            ) : z.serviser_dodijeljen_id ? (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                Serviser dodijeljen
              </span>
            ) : (
              <span className="flex items-center gap-1.5" style={{ color: '#D97706' }}>
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Bez servisera
              </span>
            )}
            {terminStr && (
              <span className="flex items-center gap-1.5" style={{ color: kasni ? '#DC2626' : 'var(--first-nonary)' }}>
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {terminStr}
              </span>
            )}
          </div>
        </div>

        {/* Strelica desno */}
        <div className="flex items-center px-3">
          <ChevronRight
            className="h-4 w-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            style={{ color: 'var(--first-quinary)' }}
          />
        </div>
      </Link>
    </li>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function DispecerIntervencijePage() {
  const [intervencije, setIntervencije] = useState<IntervencijaRed[]>([]);
  const [ucitava,      setUcitava]      = useState(true);
  const [greska,       setGreska]       = useState<string | null>(null);
  const [aktivniKpi,   setAktivniKpi]   = useState<KpiFilter>('sve');

  const ucitaj = useCallback(async (tiho = false) => {
    if (!tiho) { setUcitava(true); setGreska(null); }
    try {
      const r = await fetch(
        '/api/dispecer/zahtjevi?status=dodijeljeno,u_radu,u_izvrsenju,zavrseno',
        { cache: 'no-store' },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      setIntervencije(d.zahtjevi ?? []);
    } catch (err) {
      if (!tiho) setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju intervencija.');
    } finally {
      if (!tiho) setUcitava(false);
    }
  }, []);

  useEffect(() => { void ucitaj(); }, [ucitaj]);

  useEffect(() => {
    const t = setInterval(() => void ucitaj(true), 30_000);
    return () => clearInterval(t);
  }, [ucitaj]);

  // ─── KPI statistike ────────────────────────────────────────────────────────

  const brSve         = intervencije.length;
  const brHitnih      = useMemo(() => intervencije.filter(jeHitna).length, [intervencije]);
  const brNaTerenu    = useMemo(() => intervencije.filter((z) => z.status === 'u_izvrsenju').length, [intervencije]);
  const brNaPutu      = useMemo(() => intervencije.filter((z) => z.status === 'u_radu').length, [intervencije]);
  const brDodijeljeno = useMemo(() => intervencije.filter((z) => z.status === 'dodijeljeno').length, [intervencije]);
  const brKasni       = useMemo(() => intervencije.filter(jeKasni).length, [intervencije]);
  const brZavrseno    = useMemo(() => intervencije.filter((z) => z.status === 'zavrseno' && !(z as any).closed_at).length, [intervencije]);
  const brSlaPrekoraceno = useMemo(() => intervencije.filter((z) => getSlaStatus(z.created_at, z.final_priority, z.status) === 'prekoraceno').length, [intervencije]);

  const filtriran = useMemo(() => filtrirajPoKpi(intervencije, aktivniKpi), [intervencije, aktivniKpi]);

  const sortirano = useMemo(() => [...filtriran].sort((a, b) => {
    // Premium/Hitno first
    if (Boolean(a.is_premium) !== Boolean(b.is_premium)) return a.is_premium ? -1 : 1;
    // Kasne first
    if (jeKasni(a) !== jeKasni(b)) return jeKasni(a) ? -1 : 1;
    // Urgency
    return (b.urgency_score ?? 0) - (a.urgency_score ?? 0);
  }), [filtriran]);

  const kpiKartice = [
    { key: 'sve'         as KpiFilter, oznaka: 'Sve aktivne',    v: brSve,         boja: 'var(--first-secondary)',    Ikona: CheckCircle2  },
    { key: 'hitno'       as KpiFilter, oznaka: 'Hitne',          v: brHitnih,      boja: '#DC2626',                   Ikona: Zap           },
    { key: 'u_izvrsenju' as KpiFilter, oznaka: 'Na terenu',      v: brNaTerenu,    boja: 'var(--first-secondary)',    Ikona: MapPin        },
    { key: 'u_radu'      as KpiFilter, oznaka: 'Na putu',        v: brNaPutu,      boja: 'var(--first-secondary)',    Ikona: Truck         },
    { key: 'dodijeljeno' as KpiFilter, oznaka: 'Čekaju prihv.',  v: brDodijeljeno, boja: '#D97706',                   Ikona: Clock         },
    { key: 'kasni'       as KpiFilter, oznaka: 'Kašnjenja',      v: brKasni,       boja: brKasni > 0 ? '#DC2626' : 'var(--first-nonary)', Ikona: AlertCircle },
    { key: 'zavrseno'   as KpiFilter, oznaka: 'Čeka zatvaranje', v: brZavrseno,       boja: brZavrseno > 0 ? '#D97706' : 'var(--first-nonary)',       Ikona: CheckCircle2 },
    { key: 'sla'        as KpiFilter, oznaka: 'Prekoračen SLA',  v: brSlaPrekoraceno, boja: brSlaPrekoraceno > 0 ? '#DC2626' : 'var(--first-nonary)', Ikona: AlertTriangle },
  ];

  const aktivniLabel = kpiKartice.find((k) => k.key === aktivniKpi)?.oznaka ?? 'Sve aktivne';

  return (
    <AppShell uloga="dispecer">
      {/* Zaglavlje */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dispecer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-black/[0.04]"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kontrolna ploča
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
              Praćenje intervencija
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Operativni pregled svih aktivnih intervencija u realnom vremenu
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => void ucitaj(false)}
            isLoading={ucitava}
            loadingText="Osvježavanje..."
          >
            <RefreshCw className="h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </div>

      {greska && <div className="mb-5"><AlertMessage variant="error" message={greska} /></div>}

      {/* KPI kartice */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {kpiKartice.map(({ key, oznaka, v, boja, Ikona }) => (
          <KpiKartica
            key={key}
            oznaka={oznaka}
            vrijednost={v}
            boja={boja}
            Ikona={Ikona}
            aktivan={aktivniKpi === key}
            onClick={() => setAktivniKpi(aktivniKpi === key ? 'sve' : key)}
          />
        ))}
      </div>

      {/* Filter chip info */}
      {aktivniKpi !== 'sve' && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
            {aktivniLabel}
          </span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
            style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.3)', color: 'var(--first-nonary)' }}>
            {sortirano.length}
          </span>
          <button
            type="button"
            onClick={() => setAktivniKpi('sve')}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-nonary)' }}
          >
            × Ukloni filter
          </button>
        </div>
      )}

      {/* Lista intervencija */}
      <div
        className="rounded-2xl"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.28)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Intervencije — {aktivniLabel}
          </h2>
          {!ucitava && (
            <span className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              {sortirano.length} intervencij{sortirano.length === 1 ? 'a' : sortirano.length < 5 ? 'e' : 'a'}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-2 p-3">
          {ucitava && (
            <li className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
                  style={{ borderTopColor: 'var(--first-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje intervencija...</p>
              </div>
            </li>
          )}

          {!ucitava && sortirano.length === 0 && (
            <li className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--first-quinary)' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
                  {aktivniKpi !== 'sve' ? `Nema intervencija za filter "${aktivniLabel}"` : 'Nema aktivnih intervencija'}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
                  {aktivniKpi !== 'sve' ? 'Promijenite filter ili osvježite prikaz.' : 'Sve intervencije su završene.'}
                </p>
              </div>
              {aktivniKpi !== 'sve' && (
                <button
                  type="button"
                  onClick={() => setAktivniKpi('sve')}
                  className="text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--first-secondary)' }}
                >
                  Prikaži sve intervencije
                </button>
              )}
            </li>
          )}

          {!ucitava && sortirano.map((z) => (
            <IntervencijaKartica key={z.id} z={z} />
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
