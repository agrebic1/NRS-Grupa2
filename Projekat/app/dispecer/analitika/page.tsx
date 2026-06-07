'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, BarChart3, CheckCircle2, Clock,
  TrendingUp, AlertTriangle, Users, RotateCcw, Inbox, PieChart, Star,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { BarChart, DonutChart, LineChart } from '@/components/dispecer/grafovi/Grafovi';
import { statusBoja, statusOznaka } from '@/lib/servisirane/statusBoja';
import type { AnalitikaMetrike } from '@/lib/servisirane/analitikaMetrike';

// ─── Helperi ──────────────────────────────────────────────────────────────────

function formatMin(min: number | null): string {
  if (min == null) return '-';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function danasnjiDatum(): string {
  return new Date().toISOString().substring(0, 10);
}

function prvogMjeseca(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function fmtKratkiDatum(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
}

// ─── KPI kartica ──────────────────────────────────────────────────────────────

function KpiKartica({
  oznaka, vrijednost, boja, Ikona,
}: {
  oznaka:     string;
  vrijednost: string;
  boja:       string;
  Ikona:      React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in srgb, ${boja} 14%, transparent)` }}
      >
        <Ikona className="h-5 w-5" style={{ color: boja }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold leading-none tabular-nums" style={{ color: boja }}>
          {vrijednost}
        </p>
        <p className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--first-nonary)' }}>
          {oznaka}
        </p>
      </div>
    </div>
  );
}

// ─── Kartica grafa ──────────────────────────────────────────────────────────────

function GrafKartica({
  naslov, Ikona, children,
}: {
  naslov:   string;
  Ikona:    React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Ikona className="h-4 w-4" style={{ color: 'var(--first-secondary)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>{naslov}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function AnalitikaPage() {
  const [podaci,  setPodaci]  = useState<AnalitikaMetrike | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [greska,  setGreska]  = useState<string | null>(null);
  const [od,      setOd]      = useState(prvogMjeseca());
  const [doDat,   setDoDat]   = useState(danasnjiDatum());

  const ucitaj = useCallback(async () => {
    setUcitava(true); setGreska(null);
    try {
      const r = await fetch(`/api/dispecer/analitika?od=${od}&do=${doDat}`, { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      setPodaci(d);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška.');
    } finally {
      setUcitava(false);
    }
  }, [od, doDat]);

  useEffect(() => { void ucitaj(); }, [ucitaj]);

  const slaUkupno = podaci ? podaci.sla.na_vrijeme + podaci.sla.prekoraceno : 0;
  const slaPosto  = slaUkupno > 0 ? Math.round((podaci!.sla.na_vrijeme / slaUkupno) * 100) : null;
  const imaPodataka = podaci && podaci.ukupno_zahtjeva > 0;

  return (
    <AppShell uloga="dispecer">
      {/* Zaglavlje */}
      <div className="mb-6">
        <div className="mb-4">
          <Link
            href="/dispecer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-black/[0.04]"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kontrolna ploča
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
              Analitika
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Vizualni pregled ključnih pokazatelja sistema po periodu
            </p>
          </div>
          {/* Filter datuma */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="analitika-od" className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>Od</label>
              <input
                id="analitika-od" type="date" value={od} onChange={(e) => setOd(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)', color: 'var(--first-octonary)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="analitika-do" className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>Do</label>
              <input
                id="analitika-do" type="date" value={doDat} onChange={(e) => setDoDat(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)', color: 'var(--first-octonary)' }}
              />
            </div>
            <Button variant="secondary" size="md" onClick={ucitaj} isLoading={ucitava} loadingText="Učitavanje...">
              <RefreshCw className="h-4 w-4" />Primijeni
            </Button>
          </div>
        </div>
      </div>

      {greska && <div className="mb-5"><AlertMessage variant="error" message={greska} /></div>}

      {/* Loading */}
      {ucitava && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje analitike...</p>
          </div>
        </div>
      )}

      {/* Prazno stanje */}
      {!ucitava && !greska && !imaPodataka && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
          }}
        >
          <Inbox className="h-10 w-10" style={{ color: 'var(--first-quinary)' }} aria-hidden />
          <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Nema podataka za odabrani period
          </p>
          <p className="max-w-sm text-sm" style={{ color: 'var(--first-nonary)' }}>
            Promijenite datumski opseg ili provjerite da li u sistemu postoje zahtjevi.
          </p>
        </div>
      )}

      {/* Sadržaj */}
      {!ucitava && imaPodataka && podaci && (
        <div className="flex flex-col gap-5">
          {/* KPI kartice */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <KpiKartica oznaka="Ukupno zahtjeva" vrijednost={String(podaci.ukupno_zahtjeva)} boja="var(--first-secondary)" Ikona={Inbox} />
            <KpiKartica oznaka="Završenih" vrijednost={String(podaci.ukupno_zavrsenih)} boja="#166534" Ikona={CheckCircle2} />
            <KpiKartica oznaka="Prosjek odziva" vrijednost={formatMin(podaci.avg_odziv_minuta)} boja="var(--first-primary)" Ikona={Clock} />
            <KpiKartica oznaka="Prosjek trajanja" vrijednost={formatMin(podaci.avg_trajanje_minuta)} boja="#D97706" Ikona={TrendingUp} />
            <KpiKartica
              oznaka="SLA na vrijeme"
              vrijednost={slaPosto != null ? `${slaPosto}%` : '-'}
              boja={slaPosto != null && slaPosto < 70 ? '#DC2626' : '#166534'}
              Ikona={slaPosto != null && slaPosto < 70 ? AlertTriangle : CheckCircle2}
            />
          </div>

          {/* Grafovi - red 1 */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GrafKartica naslov="SLA usklađenost" Ikona={PieChart}>
              <DonutChart
                centarLabela="završenih"
                segmenti={[
                  { labela: 'Na vrijeme',  vrijednost: podaci.sla.na_vrijeme,   boja: '#16A34A' },
                  { labela: 'Prekoračeno', vrijednost: podaci.sla.prekoraceno,  boja: '#DC2626' },
                  { labela: 'Bez podataka', vrijednost: podaci.sla.bez_podataka, boja: 'rgb(var(--first-quaternary-rgb))' },
                ]}
              />
            </GrafKartica>

            <GrafKartica naslov="Zahtjevi po statusu" Ikona={BarChart3}>
              <BarChart
                podaci={podaci.po_statusu.map((s) => ({
                  labela:     statusOznaka(s.status),
                  vrijednost: s.broj,
                  boja:       statusBoja(s.status),
                }))}
              />
            </GrafKartica>
          </div>

          {/* Korisničke ocjene */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4" style={{ color: '#CA8A04' }} />
              <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
                Korisničke ocjene
              </h2>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiKartica
                oznaka="Prosječna ocjena"
                vrijednost={podaci.ocjene.prosjecna_ocjena != null ? `${podaci.ocjene.prosjecna_ocjena}/5` : '-'}
                boja="#CA8A04"
                Ikona={Star}
              />
              <KpiKartica
                oznaka="Ocijenjeno"
                vrijednost={String(podaci.ocjene.ukupno_ocijenjeno)}
                boja="#92400E"
                Ikona={CheckCircle2}
              />
              <KpiKartica
                oznaka="Zatvoreno"
                vrijednost={String(podaci.ocjene.ukupno_zatvorenih)}
                boja="var(--first-secondary)"
                Ikona={Inbox}
              />
              <KpiKartica
                oznaka="Stopa odgovora"
                vrijednost={
                  podaci.ocjene.stopa_odgovora_posto != null
                    ? `${podaci.ocjene.stopa_odgovora_posto}%`
                    : '-'
                }
                boja="#166534"
                Ikona={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <GrafKartica naslov="Raspodjela ocjena (1–5)" Ikona={BarChart3}>
                <BarChart
                  praznoTekst="Nema ocjena u odabranom periodu."
                  podaci={podaci.ocjene.raspodjela.map((r) => ({
                    labela:     `${r.ocjena} ★`,
                    vrijednost: r.broj,
                    boja:       r.ocjena >= 4 ? '#16A34A' : r.ocjena === 3 ? '#D97706' : '#DC2626',
                  }))}
                />
              </GrafKartica>

              <GrafKartica naslov="Trend ocjena po danu" Ikona={TrendingUp}>
                <LineChart
                  tacke={podaci.ocjene.trend_ocijenjenih.map((t) => ({
                    labela:     fmtKratkiDatum(t.datum),
                    vrijednost: t.broj,
                  }))}
                />
                <p className="mt-3 text-[11px]" style={{ color: 'var(--first-nonary)' }}>
                  Broj ocjena ostavljenih po danu. Detalji po intervenciji:{' '}
                  <Link
                    href="/dispecer/intervencije?filter=zatvoreni"
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: 'var(--first-secondary)' }}
                  >
                    Završeni
                  </Link>.
                </p>
              </GrafKartica>
            </div>
          </div>

          {/* Grafovi - red 2 */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GrafKartica naslov="Opterećenje po serviseru" Ikona={Users}>
              <BarChart
                praznoTekst="Nema aktivnih dodjela ni završenih intervencija u periodu."
                podaci={podaci.opterecenje_servisera.slice(0, 8).map((s) => ({
                  labela:     s.ime,
                  vrijednost: s.aktivnih + s.zavrsenih,
                }))}
                formatVrijednost={(v) => String(v)}
              />
              <p className="mt-3 text-[11px]" style={{ color: 'var(--first-nonary)' }}>
                Ukupno (aktivnih + završenih u periodu). Detalji odziva: {' '}
                <Link href="/dispecer/izvjestaj/odziva" className="font-semibold underline-offset-2 hover:underline" style={{ color: 'var(--first-secondary)' }}>
                  izvještaj odziva
                </Link>.
              </p>
            </GrafKartica>

            <GrafKartica naslov="Trend završenih intervencija" Ikona={TrendingUp}>
              <LineChart
                tacke={podaci.trend_zavrsenih.map((t) => ({ labela: fmtKratkiDatum(t.datum), vrijednost: t.broj }))}
              />
            </GrafKartica>
          </div>

          {/* Ponovni ciklusi */}
          <div
            className="flex flex-wrap items-center gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'color-mix(in srgb, #D97706 14%, transparent)' }}>
              <RotateCcw className="h-5 w-5" style={{ color: '#D97706' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
                Ponovni ciklusi (re-dodjele / nije riješeno)
              </p>
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                <span className="font-bold tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                  {podaci.ponovni_ciklusi.zahtjeva_s_ponavljanjem}
                </span> zahtjeva ·{' '}
                <span className="font-bold tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                  {podaci.ponovni_ciklusi.ukupno_ciklusa}
                </span> ukupnih ciklusa
              </p>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
            Period: {podaci.period.od} — {podaci.period.do}.
          </p>
        </div>
      )}
    </AppShell>
  );
}
