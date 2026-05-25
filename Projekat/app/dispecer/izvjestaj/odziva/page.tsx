'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, Clock, CheckCircle2, Users,
  TrendingUp, AlertTriangle, User, ChevronDown, ChevronUp,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type {
  IzvjestajOdzivaOdgovor,
  ServiserOdzivaRed,
  IntervencijaOdzivaRed,
} from '@/lib/servisirane/izvjestajiOdziva';

// ─── Helperi ──────────────────────────────────────────────────────────────────

function formatMin(min: number | null): string {
  if (min == null) return '-';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function slaBoja(posto: number | null): string {
  if (posto == null) return 'var(--first-nonary)';
  if (posto >= 90) return '#16A34A';
  if (posto >= 70) return '#D97706';
  return '#DC2626';
}

function fmtDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function prioritetBoja(p: string | null): string {
  if (!p) return 'var(--first-nonary)';
  const m: Record<string, string> = {
    HITNO: '#DC2626', 'KRITIČNO': '#991B1B', VISOKO: '#EA580C',
    SREDNJE: '#D97706', NISKO: 'var(--first-secondary)',
  };
  return m[p] ?? 'var(--first-nonary)';
}

function danasnjiDatum(): string {
  return new Date().toISOString().substring(0, 10);
}

function prvogMjeseca(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
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
      <div>
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

// ─── Expand detalj — intervencije servisera ───────────────────────────────────

function ServiserDetalj({ intervencije }: { intervencije: IntervencijaOdzivaRed[] }) {
  if (intervencije.length === 0) {
    return (
      <tr>
        <td colSpan={5}>
          <div className="px-8 py-4 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Nema podataka o intervencijama.
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={5} className="px-0 py-0">
        <div
          className="mx-4 mb-3 overflow-hidden rounded-xl"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.35)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.28)',
          }}
        >
          {/* Zaglavlje detalja */}
          <div
            className="px-4 py-2.5"
            style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.2)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>
              Detalji intervencija ({intervencije.length})
            </p>
          </div>

          {/* Mini tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.2)' }}>
                  {['#', 'Datum završetka', 'Prioritet', 'Odziv', 'Trajanje', 'SLA'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {intervencije.map((int, i) => (
                  <tr
                    key={int.zahtjev_id}
                    style={{
                      borderBottom: i < intervencije.length - 1
                        ? '1px solid rgb(var(--first-quaternary-rgb)/0.14)'
                        : 'none',
                    }}
                  >
                    {/* Broj intervencije */}
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/dispecer/zahtjevi/${int.zahtjev_id}`}
                        className="font-bold tabular-nums underline-offset-2 hover:underline"
                        style={{ color: 'var(--first-secondary)' }}
                      >
                        #{int.zahtjev_id}
                      </Link>
                    </td>

                    {/* Datum završetka */}
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                      {fmtDatum(int.zavrseno_at)}
                    </td>

                    {/* Prioritet */}
                    <td className="px-4 py-2.5">
                      {int.final_priority ? (
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            color: prioritetBoja(int.final_priority),
                            backgroundColor: `color-mix(in srgb, ${prioritetBoja(int.final_priority)} 10%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${prioritetBoja(int.final_priority)} 25%, transparent)`,
                          }}
                        >
                          {int.final_priority}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--first-nonary)' }}>-</span>
                      )}
                    </td>

                    {/* Odziv */}
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                      {formatMin(int.odziv_minuta)}
                    </td>

                    {/* Trajanje */}
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                      {formatMin(int.trajanje_minuta)}
                    </td>

                    {/* SLA */}
                    <td className="px-4 py-2.5">
                      {int.sla_ok === null ? (
                        <span style={{ color: 'var(--first-nonary)' }}>-</span>
                      ) : int.sla_ok ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#16A34A' }}>
                          <CheckCircle2 className="h-3 w-3" />OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#DC2626' }}>
                          <XCircle className="h-3 w-3" />Prekoračeno
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Red servisera (klikabilan) ───────────────────────────────────────────────

function ServiserRed({
  s, i, ukupno, otvoren, onToggle,
}: {
  s:        ServiserOdzivaRed;
  i:        number;
  ukupno:   number;
  otvoren:  boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderBottom: !otvoren && i < ukupno - 1
            ? '1px solid rgb(var(--first-quaternary-rgb)/0.18)'
            : 'none',
          backgroundColor: otvoren
            ? 'rgb(var(--first-secondary-rgb) / 0.04)'
            : i % 2 === 0 ? 'transparent' : 'rgb(var(--first-quinary-rgb)/0.08)',
          cursor: 'pointer',
          transition: 'background-color 150ms',
        }}
        className="hover:bg-[rgb(var(--first-quinary-rgb)/0.14)]"
      >
        {/* Serviser */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
              style={{
                backgroundColor: otvoren
                  ? 'rgb(var(--first-secondary-rgb)/0.18)'
                  : 'rgb(var(--first-secondary-rgb)/0.1)',
                color: 'var(--first-secondary)',
              }}
            >
              {s.ime[0]}{s.prezime[0]}
            </div>
            <span className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
              {s.ime} {s.prezime}
            </span>
          </div>
        </td>

        {/* Intervencija */}
        <td className="px-5 py-3.5">
          <span
            className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
              color: 'var(--first-secondary)',
            }}
          >
            {s.broj_intervencija}
          </span>
        </td>

        {/* Prosjek odziva */}
        <td className="px-5 py-3.5">
          <span
            className="tabular-nums font-medium"
            style={{ color: s.avg_odziv_minuta != null ? 'var(--first-octonary)' : 'var(--first-nonary)' }}
          >
            {formatMin(s.avg_odziv_minuta)}
          </span>
        </td>

        {/* Prosjek trajanja */}
        <td className="px-5 py-3.5">
          <span
            className="tabular-nums font-medium"
            style={{ color: s.avg_trajanje_minuta != null ? 'var(--first-octonary)' : 'var(--first-nonary)' }}
          >
            {formatMin(s.avg_trajanje_minuta)}
          </span>
        </td>

        {/* SLA compliance + toggle */}
        <td className="px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {s.sla_compliance_posto != null ? (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-20 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.sla_compliance_posto}%`,
                      backgroundColor: slaBoja(s.sla_compliance_posto),
                    }}
                  />
                </div>
                <span
                  className="tabular-nums text-xs font-bold"
                  style={{ color: slaBoja(s.sla_compliance_posto) }}
                >
                  {s.sla_compliance_posto}%
                </span>
              </div>
            ) : (
              <span style={{ color: 'var(--first-nonary)' }}>-</span>
            )}
            {/* Expand ikona */}
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: otvoren
                  ? 'rgb(var(--first-secondary-rgb)/0.12)'
                  : 'rgb(var(--first-quaternary-rgb)/0.18)',
                color: otvoren ? 'var(--first-secondary)' : 'var(--first-nonary)',
              }}
            >
              {otvoren
                ? <ChevronUp className="h-3.5 w-3.5" />
                : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </td>
      </tr>

      {/* Expand detalj */}
      {otvoren && <ServiserDetalj intervencije={s.intervencije} />}

      {/* Separator ispod expand sekcije */}
      {otvoren && i < ukupno - 1 && (
        <tr>
          <td
            colSpan={5}
            style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.18)', padding: 0 }}
          />
        </tr>
      )}
    </>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function IzvjestajOdzivaPage() {
  const [podaci,   setPodaci]   = useState<IzvjestajOdzivaOdgovor | null>(null);
  const [ucitava,  setUcitava]  = useState(true);
  const [greska,   setGreska]   = useState<string | null>(null);
  const [od,       setOd]       = useState(prvogMjeseca());
  const [doDat,    setDoDat]    = useState(danasnjiDatum());
  const [otvoriId, setOtvoriId] = useState<string | null>(null);

  const ucitaj = useCallback(async () => {
    setUcitava(true); setGreska(null); setOtvoriId(null);
    try {
      const r = await fetch(
        `/api/dispecer/izvjestaj/odziva?od=${od}&do=${doDat}`,
        { cache: 'no-store' }
      );
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

  const uk = podaci?.ukupno;

  function toggleServiser(id: string) {
    setOtvoriId((prev) => (prev === id ? null : id));
  }

  return (
    <AppShell uloga="dispecer">
      {/* Zaglavlje */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
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
              Izvještaj odziva servisera
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Analiza performansi tima po vremenskom periodu · kliknite na servisera za detalje
            </p>
          </div>
          {/* Filter datuma */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>Od</label>
              <input
                type="date" value={od} onChange={(e) => setOd(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)', color: 'var(--first-octonary)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>Do</label>
              <input
                type="date" value={doDat} onChange={(e) => setDoDat(e.target.value)}
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

      {/* KPI kartice */}
      {uk && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiKartica
            oznaka="Ukupno završenih"
            vrijednost={String(uk.broj_intervencija)}
            boja="var(--first-secondary)"
            Ikona={CheckCircle2}
          />
          <KpiKartica
            oznaka="Prosjek odziva"
            vrijednost={formatMin(uk.avg_odziv_minuta)}
            boja="var(--first-primary)"
            Ikona={Clock}
          />
          <KpiKartica
            oznaka="Prosjek trajanja"
            vrijednost={formatMin(uk.avg_trajanje_minuta)}
            boja="#D97706"
            Ikona={TrendingUp}
          />
          <KpiKartica
            oznaka="SLA compliance"
            vrijednost={uk.sla_compliance_posto != null ? `${uk.sla_compliance_posto}%` : '-'}
            boja={slaBoja(uk.sla_compliance_posto)}
            Ikona={uk.sla_compliance_posto != null && uk.sla_compliance_posto < 70 ? AlertTriangle : CheckCircle2}
          />
        </div>
      )}

      {/* Tabela servisera */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.32)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.28)' }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: 'var(--first-secondary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
              Serviseri
              {podaci && (
                <span className="ml-2 text-sm font-normal" style={{ color: 'var(--first-nonary)' }}>
                  {podaci.period.od} — {podaci.period.do}
                </span>
              )}
            </h2>
          </div>
          {!ucitava && podaci && (
            <span className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              {podaci.serviseri.length} serviser{podaci.serviseri.length === 1 ? '' : 'a'}
              {' · '}
              <span style={{ color: 'var(--first-secondary)' }}>kliknite red za detalje</span>
            </span>
          )}
        </div>

        {ucitava && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'var(--first-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje izvještaja...</p>
            </div>
          </div>
        )}

        {!ucitava && podaci?.serviseri.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <User className="h-10 w-10" style={{ color: 'var(--first-quinary)' }} />
            <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
              Nema podataka za odabrani period
            </p>
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Promijenite datumski opseg ili provjerite da li postoje završene intervencije.
            </p>
          </div>
        )}

        {!ucitava && podaci && podaci.serviseri.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.25)' }}>
                  {['Serviser', 'Intervencija', 'Prosjek odziva', 'Prosjek trajanja', 'SLA compliance'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {podaci.serviseri.map((s: ServiserOdzivaRed, i) => (
                  <ServiserRed
                    key={s.serviser_id}
                    s={s}
                    i={i}
                    ukupno={podaci.serviseri.length}
                    otvoren={otvoriId === s.serviser_id}
                    onToggle={() => toggleServiser(s.serviser_id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
