'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wrench, MapPin, Calendar, Clock, AlertTriangle,
  CheckCircle2, Truck, ChevronRight, RefreshCw,
  ClipboardList, Zap, Shield, Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { prioritetBoja, statusBoja, statusOznaka } from '@/lib/servisirane/statusBoja';

// ─── Tipovi ───────────────────────────────────────────────────────────────────

interface IntervencijaZaListu extends ServisniZahtjev {
  podnosilac:          { ime: string; prezime: string; broj_telefona: string | null } | null;
  uloga_u_intervenciji?: 'glavni' | 'pomocni';
}

// ─── Helperi ─────────────────────────────────────────────────────────────────

function fmtTermin(iso: string): string {
  const d = new Date(iso);
  const danas = new Date();
  const jucer  = new Date(danas);
  jucer.setDate(danas.getDate() - 1);
  const sutra  = new Date(danas);
  sutra.setDate(danas.getDate() + 1);

  const sat = d.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === danas.toDateString()) return `Danas, ${sat}`;
  if (d.toDateString() === sutra.toDateString()) return `Sutra, ${sat}`;
  return `${d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit' })}, ${sat}`;
}

function jeKasni(z: IntervencijaZaListu): boolean {
  if (!z.termin_planirani_pocetak) return false;
  if (['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno'].includes(z.status)) return false;
  return new Date(z.termin_planirani_pocetak) < new Date();
}

function grupiraj(intervencije: IntervencijaZaListu[]) {
  const hitne    = intervencije.filter((z) => ['dodijeljeno','u_radu','u_izvrsenju'].includes(z.status) && ((z.urgency_score ?? 0) >= 75 || z.is_premium));
  const hitneIds = new Set(hitne.map((z) => z.id));
  const aktivne  = intervencije.filter((z) => ['dodijeljeno','u_radu','u_izvrsenju'].includes(z.status) && !hitneIds.has(z.id));
  const zavrsene = intervencije.filter((z) => ['zavrseno','zatvoreno'].includes(z.status));
  const ostale   = intervencije.filter((z) => !['dodijeljeno','u_radu','u_izvrsenju','zavrseno','zatvoreno'].includes(z.status));
  return { hitne, aktivne, zavrsene, ostale };
}

// ─── KPI kartica ─────────────────────────────────────────────────────────────

function KpiKartica({ v, oznaka, boja, Ikona }: {
  v: number; oznaka: string; boja: string;
  Ikona: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4"
      style={{ backgroundColor: 'rgb(var(--first-quinary-rgb)/0.22)', border: '1px solid rgb(var(--first-quaternary-rgb)/0.35)' }}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${boja} 12%, transparent)` }}>
        <Ikona className="h-4 w-4" style={{ color: boja }} />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums" style={{ color: boja }}>{v}</p>
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>{oznaka}</p>
      </div>
    </div>
  );
}

// ─── Kartica intervencije ─────────────────────────────────────────────────────

function IntervencijaKartica({ z }: { z: IntervencijaZaListu }) {
  const kat     = labelKategorije(z);
  const naslov  = kat.podkategorija ?? kat.glavna;
  const kasni   = jeKasni(z);
  const pboja   = prioritetBoja(z.final_priority);
  const sboja   = statusBoja(z.status);
  const jeAktivna = ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(z.status);
  const jePomocni = z.uloga_u_intervenciji === 'pomocni';

  return (
    <Link
      href={`/serviser/intervencije/${z.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor:  'rgb(255 255 255/0.85)',
        border:           '1px solid rgb(var(--first-quaternary-rgb)/0.32)',
        borderLeftWidth:  4,
        borderLeftColor:  kasni ? '#DC2626' : z.is_premium ? '#DC2626' : pboja,
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0 p-4">
        {/* Badges red */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
            style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.22)', color: 'var(--first-nonary)' }}>
            #{z.id}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `color-mix(in srgb, ${sboja} 10%, transparent)`, color: sboja, border: `1px solid color-mix(in srgb, ${sboja} 22%, transparent)` }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sboja }} />
            {statusOznaka(z.status)}
          </span>
          {z.final_priority && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: `color-mix(in srgb, ${pboja} 10%, transparent)`, color: pboja, border: `1px solid color-mix(in srgb, ${pboja} 20%, transparent)` }}>
              <Zap className="h-3 w-3" />{z.final_priority}
            </span>
          )}
          {z.is_premium && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              <Shield className="h-3 w-3" />Premium
            </span>
          )}
          {jePomocni && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)', color: 'var(--first-secondary)', border: '1px solid rgb(var(--first-secondary-rgb)/0.2)' }}>
              <Users className="h-3 w-3" />Pomoćni
            </span>
          )}
          {kasni && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              <AlertTriangle className="h-3 w-3" />Kasni
            </span>
          )}
        </div>

        {/* Naslov */}
        <p className="font-bold leading-snug" style={{ color: 'var(--first-octonary)' }}>{naslov}</p>
        {kat.podkategorija && (
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>{kat.glavna}</p>
        )}

        {/* Opis */}
        {z.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
            {z.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
          {z.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1 max-w-[200px]">{z.address}</span>
            </span>
          )}
          {z.termin_planirani_pocetak && (
            <span className="flex items-center gap-1" style={{ color: kasni ? '#DC2626' : 'var(--first-nonary)', fontWeight: kasni ? 700 : 400 }}>
              <Calendar className="h-3 w-3 flex-shrink-0" />
              {fmtTermin(z.termin_planirani_pocetak)}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      {jeAktivna && (
        <div className="flex items-center justify-between border-t px-4 py-2.5"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--first-secondary)' }}>
            Otvori detalje
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--first-secondary)' }} />
        </div>
      )}
    </Link>
  );
}

// ─── Sekcija grupe ────────────────────────────────────────────────────────────

function GrupaSekcija({ naslov, ikona: IkonaProp, boja, intervencije, prazanTekst }: {
  naslov: string;
  ikona: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  boja: string;
  intervencije: IntervencijaZaListu[];
  prazanTekst?: string;
}) {
  if (intervencije.length === 0 && !prazanTekst) return null;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <IkonaProp className="h-4 w-4" style={{ color: boja }} />
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: boja }}>{naslov}</h2>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `color-mix(in srgb, ${boja} 12%, transparent)`, color: boja }}>
          {intervencije.length}
        </span>
      </div>
      {intervencije.length === 0 ? (
        <p className="rounded-xl px-4 py-3 text-sm" style={{ color: 'var(--first-nonary)', backgroundColor: 'rgb(var(--first-quinary-rgb)/0.2)' }}>
          {prazanTekst}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {intervencije.map((z) => <IntervencijaKartica key={z.id} z={z} />)}
        </div>
      )}
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function ServiserIntervencijaListaPage() {
  const [sve,     setSve]     = useState<IntervencijaZaListu[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska,  setGreska]  = useState<string | null>(null);

  async function ucitaj() {
    setUcitava(true); setGreska(null);
    try {
      const r = await fetch('/api/serviser/intervencije', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      setSve(d.intervencije ?? []);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju.');
    } finally { setUcitava(false); }
  }

  useEffect(() => { ucitaj(); }, []);

  const { hitne, aktivne, zavrsene, ostale } = useMemo(() => grupiraj(sve), [sve]);

  const brDodijeljeno = sve.filter((z) => z.status === 'dodijeljeno').length;
  const brNaPutu      = sve.filter((z) => z.status === 'u_radu').length;
  const brNaTerenu    = sve.filter((z) => z.status === 'u_izvrsenju').length;
  const brZavrseno    = sve.filter((z) => z.status === 'zavrseno').length;

  return (
    <AppShell uloga="serviser">
      {/* Naslov */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Intervencije
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Sve vaše intervencije - kao glavni i pomoćni serviser
          </p>
        </div>
        <button type="button" onClick={ucitaj} disabled={ucitava}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-black/[0.05] disabled:opacity-50"
          style={{ border: '1px solid rgb(var(--first-quaternary-rgb)/0.35)' }}>
          <RefreshCw className={`h-4 w-4 ${ucitava ? 'animate-spin' : ''}`} style={{ color: 'var(--first-nonary)' }} />
        </button>
      </div>

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiKartica v={brDodijeljeno} oznaka="Čeka prihv." boja="var(--first-senary)"    Ikona={ClipboardList} />
        <KpiKartica v={brNaPutu}      oznaka="Na putu"     boja="var(--first-secondary)" Ikona={Truck}         />
        <KpiKartica v={brNaTerenu}    oznaka="Na terenu"   boja="var(--first-secondary)" Ikona={Wrench}        />
        <KpiKartica v={brZavrseno}    oznaka="Završeno"    boja="var(--first-nonary)"    Ikona={CheckCircle2}  />
      </div>

      {greska && <div className="mb-4"><AlertMessage variant="error" message={greska} /></div>}

      {ucitava ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje intervencija...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <GrupaSekcija
            naslov="Hitne intervencije"
            ikona={AlertTriangle}
            boja="#DC2626"
            intervencije={hitne}
          />
          <GrupaSekcija
            naslov="Aktivne"
            ikona={Clock}
            boja="var(--first-secondary)"
            intervencije={aktivne}
            prazanTekst={hitne.length === 0 ? 'Nemate aktivnih intervencija.' : undefined}
          />
          {ostale.length > 0 && (
            <GrupaSekcija
              naslov="Ostalo"
              ikona={ClipboardList}
              boja="var(--first-nonary)"
              intervencije={ostale}
            />
          )}
          <GrupaSekcija
            naslov="Završene"
            ikona={CheckCircle2}
            boja="var(--first-nonary)"
            intervencije={zavrsene}
          />

          {sve.length === 0 && !ucitava && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)' }}>
                <Wrench className="h-8 w-8" style={{ color: 'var(--first-secondary)', opacity: 0.5 }} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>Nema dodijeljenih intervencija</p>
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                Kada vam dispečer dodijeli intervenciju, pojavit će se ovdje.
              </p>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
