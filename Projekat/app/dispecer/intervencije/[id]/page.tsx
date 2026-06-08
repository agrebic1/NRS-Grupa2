'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Wrench,
  ClipboardList,
  Truck,
  Activity,
  Image as ImageIcon,
  Radio,
  PhoneCall,
  Navigation,
  CircleAlert,
  Shield,
  X,
  RotateCcw,
  Zap,
  Eye,
  Lock,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { MiniMapa } from '@/components/shared/MiniMapa';
import { NapomeneThread } from '@/components/shared/NapomeneThread';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { HistorijaAktivnostiSekcija } from '@/components/serviser/HistorijaAktivnostiSekcija';
import { PonovniCiklusBadge } from '@/components/servisirane/PonovniCiklusBadge';
import type {
  ServisniZahtjev,
  WorkEvidence,
  InterventionActivity,
} from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  prioritetBoja,
  statusBoja,
  statusOznaka,
} from '@/lib/servisirane/statusBoja';
import { fmtSat, fmtDatumKratki, fmtDatumVrijeme } from '@/lib/format/datumi';

// ─── Tip ─────────────────────────────────────────────────────────────────────

interface IntervencijaDetalji extends ServisniZahtjev {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
  serviser?: {
    id: string;
    ime: string;
    prezime: string;
    broj_telefona?: string | null;
  } | null;
}

// ─── Helperi ─────────────────────────────────────────────────────────────────

const fmtDatum = fmtDatumKratki;

function trajanjeLabel(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60),
    m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
function jeKasni(z: IntervencijaDetalji): boolean {
  if (!z.termin_planirani_pocetak) return false;
  if (['zavrseno', 'otkazano', 'odbijeno'].includes(z.status)) return false;
  return new Date(z.termin_planirani_pocetak) < new Date();
}
function pokupiSlike(z: IntervencijaDetalji): string[] {
  const slike: string[] = [];
  if (z.photo_url) slike.push(z.photo_url);
  if (
    Array.isArray(
      (z as unknown as Record<string, unknown>).attachment_image_urls,
    )
  ) {
    slike.push(
      ...(z as unknown as Record<string, string[]>).attachment_image_urls,
    );
  }
  return slike.filter(Boolean);
}
function nadjjiAktivnost(
  aktivnosti: InterventionActivity[],
  u: string,
): InterventionActivity | undefined {
  return aktivnosti.find(
    (a) =>
      (a.tip === 'status_promjena' || a.tip === 'dodjela') &&
      typeof a.metadata === 'object' &&
      a.metadata !== null &&
      (a.metadata as Record<string, string>).u === u,
  );
}

// ─── Workflow tracker ─────────────────────────────────────────────────────────

const WORKFLOW = [
  { kljuc: 'dodijeljeno', naziv: 'Dodijeljeno', Ikona: ClipboardList },
  { kljuc: 'u_radu', naziv: 'Na putu', Ikona: Truck },
  { kljuc: 'u_izvrsenju', naziv: 'Na terenu', Ikona: MapPin },
  { kljuc: 'zavrseno', naziv: 'Završeno', Ikona: CheckCircle2 },
] as const;
const WORKFLOW_RED = ['dodijeljeno', 'u_radu', 'u_izvrsenju', 'zavrseno'];

function WorkflowTracker({
  status,
  aktivnosti,
  terminPocetak,
}: {
  status: string;
  aktivnosti: InterventionActivity[];
  terminPocetak?: string | null;
}) {
  const aktivniIdx = WORKFLOW_RED.indexOf(status);
  const jeAktivna = ['u_radu', 'u_izvrsenju'].includes(status);

  function satKoraka(kljuc: string): string | null {
    if (kljuc === 'dodijeljeno' && terminPocetak) return fmtSat(terminPocetak);
    const a = nadjjiAktivnost(aktivnosti, kljuc);
    return a ? fmtSat(a.created_at) : null;
  }

  return (
    <div
      className="rounded-2xl px-6 py-5 mb-5"
      style={{
        backgroundColor: 'rgb(255 255 255/0.88)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity
            className="h-4 w-4"
            style={{ color: 'var(--first-secondary)' }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Tok intervencije
          </span>
        </div>
        {jeAktivna && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
              color: 'var(--first-secondary)',
              border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
            }}
          >
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="flex items-start">
        {WORKFLOW.map((korak, i) => {
          const done = aktivniIdx > i;
          const active = aktivniIdx === i;
          const future = aktivniIdx < i;
          const last = i === WORKFLOW.length - 1;
          const Ikona = korak.Ikona;
          const sat = satKoraka(korak.kljuc);
          return (
            <div
              key={korak.kljuc}
              className="flex flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor:
                        done || active
                          ? 'var(--first-secondary)'
                          : 'rgb(var(--first-quaternary-rgb)/0.28)',
                    }}
                  />
                )}
                <div
                  className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: done
                      ? 'var(--first-secondary)'
                      : active
                        ? 'var(--first-primary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.3)',
                    boxShadow: active
                      ? '0 0 0 5px rgb(var(--first-primary-rgb)/0.15)'
                      : 'none',
                  }}
                >
                  {done ? (
                    <CheckCircle2
                      style={{ width: '1.125rem', height: '1.125rem' }}
                      className="text-white"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Ikona
                      className="h-4 w-4"
                      style={{
                        color: done || active ? '#fff' : 'var(--first-nonary)',
                      }}
                    />
                  )}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        backgroundColor: 'var(--first-primary)',
                        opacity: 0.12,
                      }}
                    />
                  )}
                </div>
                {!last && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor: done
                        ? 'var(--first-secondary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.28)',
                    }}
                  />
                )}
              </div>
              <div className="mt-3 flex flex-col items-center gap-0.5 text-center">
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: active
                      ? 'var(--first-primary)'
                      : done
                        ? 'var(--first-secondary)'
                        : 'var(--first-nonary)',
                    opacity: future ? 0.5 : 1,
                  }}
                >
                  {korak.naziv}
                </span>
                {sat && (
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {sat}
                  </span>
                )}
                {active && (
                  <span
                    className="mt-0.5 rounded-full px-1.5 py-px text-[9px] font-bold"
                    style={{
                      backgroundColor: 'rgb(var(--first-primary-rgb)/0.1)',
                      color: 'var(--first-primary)',
                    }}
                  >
                    Trenutno
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vremenski tok (planirano vs stvarno) ─────────────────────────────────────

function VremenjiTok({
  zahtjev,
  aktivnosti,
}: {
  zahtjev: IntervencijaDetalji;
  aktivnosti: InterventionActivity[];
}) {
  const aktDolazak = nadjjiAktivnost(aktivnosti, 'u_radu');
  const aktNaTerenu = nadjjiAktivnost(aktivnosti, 'u_izvrsenju');
  const aktZavrseno = nadjjiAktivnost(aktivnosti, 'zavrseno');
  const kasni = jeKasni(zahtjev);

  const tacke = [
    {
      id: 'prijava',
      label: 'Prijava zahtjeva',
      Ikona: FileText,
      planirano: fmtDatumVrijeme(zahtjev.created_at),
      stvarno: null as string | null,
      tip: 'info' as const,
    },
    {
      id: 'termin',
      label: 'Planirani početak',
      Ikona: Calendar,
      planirano: zahtjev.termin_planirani_pocetak
        ? fmtDatumVrijeme(zahtjev.termin_planirani_pocetak)
        : null,
      stvarno: aktDolazak ? fmtDatumVrijeme(aktDolazak.created_at) : null,
      tip: kasni && !aktDolazak ? ('warning' as const) : ('info' as const),
    },
    {
      id: 'teren',
      label: 'Dolazak na teren',
      Ikona: MapPin,
      planirano: zahtjev.termin_planirani_pocetak
        ? fmtSat(zahtjev.termin_planirani_pocetak)
        : null,
      stvarno: aktNaTerenu ? fmtDatumVrijeme(aktNaTerenu.created_at) : null,
      tip: 'info' as const,
    },
    {
      id: 'zavrseno',
      label: 'Završetak',
      Ikona: CheckCircle2,
      planirano: zahtjev.termin_planirani_kraj
        ? fmtSat(zahtjev.termin_planirani_kraj)
        : null,
      stvarno: aktZavrseno ? fmtDatumVrijeme(aktZavrseno.created_at) : null,
      tip: 'info' as const,
    },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'rgb(255 255 255/0.88)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
        >
          <Clock
            className="h-3.5 w-3.5"
            style={{ color: 'var(--first-secondary)' }}
          />
        </div>
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: 'var(--first-nonary)' }}
        >
          Vremenski tok
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tacke.map((t) => {
          const jeWarning = t.tip === 'warning';
          const imaStvarno = Boolean(t.stvarno);
          return (
            <div
              key={t.id}
              className="flex flex-col gap-2 rounded-xl p-3"
              style={{
                backgroundColor: jeWarning
                  ? 'rgba(220,38,38,0.04)'
                  : 'rgb(var(--first-quinary-rgb)/0.12)',
                border: jeWarning
                  ? '1px solid rgba(220,38,38,0.18)'
                  : '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <t.Ikona
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{
                    color: jeWarning ? '#DC2626' : 'var(--first-secondary)',
                  }}
                />
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: jeWarning ? '#DC2626' : 'var(--first-nonary)',
                  }}
                >
                  {t.label}
                </p>
              </div>
              {t.planirano && (
                <div>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Planirano
                  </p>
                  <p
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {t.planirano}
                  </p>
                </div>
              )}
              {imaStvarno ? (
                <div>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Stvarno
                  </p>
                  <p
                    className="text-xs font-bold tabular-nums"
                    style={{ color: 'var(--first-secondary)' }}
                  >
                    {t.stvarno}
                  </p>
                </div>
              ) : t.id !== 'prijava' ? (
                <p
                  className="text-[10px] italic"
                  style={{ color: 'var(--first-quinary)' }}
                >
                  Čeka se
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time-on-task KPI ─────────────────────────────────────────────────────────

function TimeOnTask({
  terminPocetak,
  procijenjeno,
  status,
}: {
  terminPocetak?: string | null;
  procijenjeno?: number | null;
  status: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!terminPocetak || ['zavrseno', 'otkazano', 'odbijeno'].includes(status))
      return;
    const start = new Date(terminPocetak).getTime();
    const upd = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 60_000)));
    upd();
    const t = setInterval(upd, 30_000);
    return () => clearInterval(t);
  }, [terminPocetak, status]);

  if (!terminPocetak || ['zavrseno', 'otkazano', 'odbijeno'].includes(status))
    return null;

  const jePrekoracio = procijenjeno ? elapsed > procijenjeno : false;
  const postotak = procijenjeno
    ? Math.min(100, Math.round((elapsed / procijenjeno) * 100))
    : null;
  const barBoja = jePrekoracio
    ? '#DC2626'
    : postotak != null && postotak > 80
      ? '#D97706'
      : 'var(--first-secondary)';

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: jePrekoracio
          ? 'rgba(220,38,38,0.04)'
          : 'rgb(255 255 255/0.88)',
        border: jePrekoracio
          ? '1px solid rgba(220,38,38,0.22)'
          : '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{
              backgroundColor: jePrekoracio
                ? 'rgba(220,38,38,0.1)'
                : 'rgb(var(--first-secondary-rgb)/0.1)',
            }}
          >
            <Clock
              className="h-5 w-5"
              style={{
                color: jePrekoracio ? '#DC2626' : 'var(--first-secondary)',
              }}
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Trajanje intervencije
            </p>
            <p
              className="text-2xl font-bold tabular-nums leading-none"
              style={{
                color: jePrekoracio ? '#DC2626' : 'var(--first-octonary)',
              }}
            >
              {trajanjeLabel(elapsed)}
            </p>
          </div>
        </div>
        {procijenjeno && (
          <div className="text-right flex-shrink-0">
            <p
              className="text-[10px] font-semibold"
              style={{ color: 'var(--first-nonary)' }}
            >
              Procijenjeno
            </p>
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: 'var(--first-nonary)' }}
            >
              {trajanjeLabel(procijenjeno)}
            </p>
          </div>
        )}
      </div>
      {postotak !== null && (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-xs font-semibold"
              style={{
                color: jePrekoracio ? '#DC2626' : 'var(--first-nonary)',
              }}
            >
              {jePrekoracio
                ? `Prekoračeno za ${trajanjeLabel(elapsed - (procijenjeno ?? 0))}`
                : `${postotak}% procijenjenog trajanja`}
            </span>
            {!jePrekoracio && (
              <span
                className="text-xs tabular-nums"
                style={{ color: 'var(--first-nonary)' }}
              >
                {postotak}%
              </span>
            )}
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.22)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${postotak}%`, backgroundColor: barBoja }}
            />
          </div>
          {jePrekoracio && (
            <p
              className="mt-1.5 flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#DC2626' }}
            >
              <AlertTriangle className="h-3 w-3" />
              Prekoračeno procijenjeno trajanje za{' '}
              {trajanjeLabel(elapsed - (procijenjeno ?? 0))}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sekcija kartica ──────────────────────────────────────────────────────────

function SekcijaKartica({
  Ikona,
  naslov,
  akcent,
  children,
}: {
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  naslov: string;
  akcent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'rgb(255 255 255/0.88)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            backgroundColor: akcent
              ? `${akcent}18`
              : 'rgb(var(--first-secondary-rgb)/0.1)',
          }}
        >
          <Ikona
            className="h-3.5 w-3.5"
            style={{ color: akcent ?? 'var(--first-secondary)' }}
          />
        </div>
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: 'var(--first-nonary)' }}
        >
          {naslov}
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── Galerija slika ───────────────────────────────────────────────────────────

function ImageGallery({ slike }: { slike: string[] }) {
  const [odabrana, setOdabrana] = useState<string | null>(null);
  if (!slike.length)
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)' }}
        >
          <ImageIcon
            className="h-6 w-6"
            style={{ color: 'var(--first-secondary)' }}
          />
        </div>
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--first-octonary)' }}
        >
          Nema priloženih fotografija
        </p>
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          Serviser još nije dodao foto dokumentaciju
        </p>
      </div>
    );
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {slike.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOdabrana(url)}
            className="group relative aspect-square overflow-hidden rounded-xl border transition-all hover:shadow-md"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Slika ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
              <ExternalLink className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>
      {odabrana && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setOdabrana(null)}
        >
          <div
            className="relative max-h-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={odabrana}
              alt="Pregled slike"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setOdabrana(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Modal: Promijeni izvršioca ───────────────────────────────────────────────

interface ServiserOpcija {
  id: string;
  ime: string;
  prezime: string;
  aktivnih_zadataka: number;
}

function PromijeniIzvrsiocaModal({
  zahtjevId,
  trenutniServIserId,
  onZatvori,
  onUspjeh,
}: {
  zahtjevId: number;
  trenutniServIserId?: string | null;
  onZatvori: () => void;
  onUspjeh: () => void;
}) {
  const [serviseri, setServiseri] = useState<ServiserOpcija[]>([]);
  const [ucitavaList, setUcitavaList] = useState(true);
  const [noviId, setNoviId] = useState('');
  const [razlog, setRazlog] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dispecer/serviseri')
      .then((r) => r.json())
      .then((d) =>
        setServiseri(
          (d.serviseri ?? []).filter(
            (s: ServiserOpcija) => s.id !== trenutniServIserId,
          ),
        ),
      )
      .finally(() => setUcitavaList(false));
  }, [trenutniServIserId]);

  async function potvrdi() {
    if (!noviId) {
      setGreska('Odaberite novog servisera.');
      return;
    }
    if (razlog.trim().length < 10) {
      setGreska('Unesite razlog (min. 10 karaktera).');
      return;
    }
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promijeni_izvrsioca',
          novi_serviser_id: noviId,
          razlog: razlog.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri promjeni servisera.');
      onUspjeh();
      onZatvori();
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User
                className="h-4 w-4"
                style={{ color: 'var(--first-secondary)' }}
              />
              <p
                className="font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                Promijeni izvršioca
              </p>
            </div>
            <button
              type="button"
              onClick={onZatvori}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/[0.06]"
            >
              <X className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
            </button>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Novi serviser *
            </label>
            {ucitavaList ? (
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                Učitavanje servisera...
              </p>
            ) : (
              <select
                value={noviId}
                onChange={(e) => setNoviId(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                  color: 'var(--first-octonary)',
                }}
              >
                <option value="">- Odaberite servisera -</option>
                {serviseri.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ime} {s.prezime} (
                    {s.aktivnih_zadataka === 1
                      ? '1 aktivni'
                      : s.aktivnih_zadataka < 5
                        ? `${s.aktivnih_zadataka} aktivna`
                        : `${s.aktivnih_zadataka} aktivnih`}
                    )
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Razlog promjene *
            </label>
            <textarea
              rows={3}
              value={razlog}
              onChange={(e) => setRazlog(e.target.value)}
              placeholder="Npr. Serviser je nedostupan ili se nalazi na drugoj lokaciji..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                color: 'var(--first-octonary)',
              }}
            />
            {greska && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {greska}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={potvrdi}
              isLoading={jeSlanje}
              loadingText="Mijenjanje..."
            >
              <User className="h-4 w-4" />
              Promijeni servisera
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onZatvori}
              disabled={jeSlanje}
            >
              Odustani
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Vrati u fazu ──────────────────────────────────────────────────────

function VratiUFazuModal({
  zahtjevId,
  onZatvori,
}: {
  zahtjevId: number;
  onZatvori: () => void;
}) {
  const [razlog, setRazlog] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function potvrdi() {
    if (razlog.trim().length < 10) {
      setGreska('Unesite razlog povratka (min. 10 karaktera).');
      return;
    }
    setJeSlanje(true);
    try {
      await fetch(`/api/dispecer/zahtjevi/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'napomena',
          sadrzaj: `[Povratak u planiranje] ${razlog.trim()}`,
        }),
      });
    } catch {
      /* non-blocking */
    } finally {
      setJeSlanje(false);
    }
    window.location.href = `/dispecer/planiranje/${zahtjevId}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" style={{ color: '#D97706' }} />
              <p
                className="font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                Vrati u planiranje
              </p>
            </div>
            <button
              type="button"
              onClick={onZatvori}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/[0.06]"
            >
              <X className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
            </button>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(217,119,6,0.06)',
              border: '1px solid rgba(217,119,6,0.2)',
            }}
          >
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              style={{ color: '#D97706' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
              Intervencija će biti vraćena u fazu planiranja. Razlog će biti
              zabilježen u historiji.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Razlog povratka *
            </label>
            <textarea
              rows={3}
              value={razlog}
              onChange={(e) => setRazlog(e.target.value)}
              placeholder="Npr. Potrebno je promijeniti servisera jer je nedostupan..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                color: 'var(--first-octonary)',
              }}
            />
            {greska && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {greska}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={potvrdi}
              isLoading={jeSlanje}
              loadingText="Preusmjeravanje..."
            >
              <RotateCcw className="h-4 w-4" />
              Vrati na planiranje
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onZatvori}
              disabled={jeSlanje}
            >
              Odustani
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Desni operativni panel ───────────────────────────────────────────────────

function DesniPanel({
  zahtjev,
  sboja,
  aktivnosti,
  ucitavaAktivnosti,
  onVratiUFazu,
  onPromijeniIzvrsioca,
}: {
  zahtjev: IntervencijaDetalji;
  sboja: string;
  aktivnosti: InterventionActivity[];
  ucitavaAktivnosti?: boolean;
  onVratiUFazu: () => void;
  onPromijeniIzvrsioca: () => void;
}) {
  const jeZavrsena = zahtjev.status === 'zavrseno';
  const jeAktivna = ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(
    zahtjev.status,
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zahtjev.address ?? '')}`;

  const kartica = {
    backgroundColor: 'rgb(255 255 255/0.88)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
  };

  return (
    <div className="lg:w-80 xl:w-88 flex-shrink-0">
      <div className="lg:sticky lg:top-4 flex flex-col gap-4">
        {/* ── Serviser (operativno dominantna kartica) ─────────────────── */}
        {zahtjev.serviser ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
              backgroundColor: 'rgb(255 255 255/0.95)',
            }}
          >
            <div
              className="px-4 py-3"
              style={{ backgroundColor: 'var(--first-primary)' }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Serviser
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
                  }}
                >
                  <Wrench
                    className="h-5 w-5"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-bold"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {zahtjev.serviser.ime} {zahtjev.serviser.prezime}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: sboja,
                        boxShadow: `0 0 5px ${sboja}`,
                      }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: sboja }}
                    >
                      {statusOznaka(zahtjev.status)}
                    </span>
                  </div>
                </div>
              </div>
              {zahtjev.serviser.broj_telefona && (
                <a
                  href={`tel:${zahtjev.serviser.broj_telefona}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-85"
                  style={{
                    backgroundColor: 'var(--first-primary)',
                    color: '#fff',
                  }}
                >
                  <PhoneCall className="h-4 w-4" />
                  Pozovi servisera
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: 'rgba(217,119,6,0.04)',
              border: '1px solid rgba(217,119,6,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CircleAlert className="h-4 w-4" style={{ color: '#D97706' }} />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: '#D97706' }}
              >
                Bez servisera
              </p>
            </div>
            <Link href={`/dispecer/planiranje/${zahtjev.id}`}>
              <Button size="sm" className="w-full">
                Dodijeli servisera
              </Button>
            </Link>
          </div>
        )}

        {/* ── Korisnik (sekundarno) ────────────────────────────────────── */}
        {zahtjev.podnosilac && (
          <div className="rounded-2xl p-4" style={kartica}>
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Podnosilac zahtjeva
            </p>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--first-quinary-rgb)/0.45)',
                }}
              >
                <User
                  className="h-4 w-4"
                  style={{ color: 'var(--first-nonary)' }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {zahtjev.podnosilac.ime} {zahtjev.podnosilac.prezime}
                </p>
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  Korisnik
                </p>
              </div>
            </div>
            {zahtjev.podnosilac.broj_telefona && (
              <a
                href={`tel:${zahtjev.podnosilac.broj_telefona}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-85"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                  color: 'var(--first-secondary)',
                  border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                }}
              >
                <Phone className="h-3.5 w-3.5" />
                {zahtjev.podnosilac.broj_telefona}
              </a>
            )}
          </div>
        )}

        {/* ── Termin ───────────────────────────────────────────────────── */}
        {zahtjev.termin_planirani_pocetak && (
          <div className="rounded-2xl p-4" style={kartica}>
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Planirani termin
            </p>
            <p
              className="text-sm font-bold mb-2"
              style={{ color: 'var(--first-octonary)' }}
            >
              {fmtDatum(zahtjev.termin_planirani_pocetak)}
            </p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Clock
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--first-secondary)' }}
                />
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: 'var(--first-secondary)' }}
                >
                  {fmtSat(zahtjev.termin_planirani_pocetak)}
                </span>
              </div>
              {zahtjev.termin_planirani_kraj && (
                <>
                  <div
                    className="h-0.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: 'rgb(var(--first-secondary-rgb)/0.2)',
                    }}
                  />
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: 'var(--first-secondary)' }}
                  >
                    {fmtSat(zahtjev.termin_planirani_kraj)}
                  </span>
                </>
              )}
            </div>
            {zahtjev.procijenjeno_trajanje && (
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                Trajanje:{' '}
                <strong>{trajanjeLabel(zahtjev.procijenjeno_trajanje)}</strong>
              </p>
            )}
          </div>
        )}

        {/* ── Mapa ─────────────────────────────────────────────────────── */}
        <MiniMapa
          adresa={zahtjev.address ?? ''}
          lat={zahtjev.latitude}
          lng={zahtjev.longitude}
          visina={190}
          prikaziFooter
          kartica
        />

        {/* ── Brze akcije (kontekstualne) ───────────────────────────────── */}
        <div className="rounded-2xl p-4" style={kartica}>
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Brze akcije
          </p>
          <div className="flex flex-col gap-2">
            {/* Primarna akcija zavisi od statusa */}
            {jeZavrsena ? (
              <Link
                href={`/dispecer/zahtjevi/${zahtjev.id}`}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--first-primary)',
                  color: '#fff',
                }}
              >
                <Eye className="h-4 w-4" />
                Pregled obrade
              </Link>
            ) : (
              <Link
                href={`/dispecer/zahtjevi/${zahtjev.id}`}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--first-primary)',
                  color: '#fff',
                }}
              >
                <ClipboardList className="h-4 w-4" />
                Obrada zahtjeva
              </Link>
            )}

            {/* Planiranje */}
            {jeAktivna && (
              <Link
                href={`/dispecer/planiranje/${zahtjev.id}`}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                  color: 'var(--first-secondary)',
                  border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                }}
              >
                <Wrench className="h-4 w-4" />
                Planiranje intervencije
              </Link>
            )}

            {/* Mapa */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
                color: 'var(--first-octonary)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
              }}
            >
              <Navigation className="h-4 w-4" />
              Otvori mapu
            </a>

            {/* Pozivi */}
            {zahtjev.serviser?.broj_telefona && (
              <a
                href={`tel:${zahtjev.serviser.broj_telefona}`}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                  color: 'var(--first-secondary)',
                  border: '1px solid rgb(var(--first-secondary-rgb)/0.18)',
                }}
              >
                <PhoneCall className="h-4 w-4" />
                Pozovi servisera
              </a>
            )}
            {zahtjev.podnosilac?.broj_telefona && (
              <a
                href={`tel:${zahtjev.podnosilac.broj_telefona}`}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--first-quinary-rgb)/0.25)',
                  color: 'var(--first-nonary)',
                  border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
                }}
              >
                <Phone className="h-4 w-4" />
                Pozovi korisnika
              </a>
            )}

            {/* Promijeni izvršioca (samo za aktivne s dodijeljenim serviserom) */}
            {jeAktivna && zahtjev.serviser && (
              <button
                type="button"
                onClick={onPromijeniIzvrsioca}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.06)',
                  color: 'var(--first-secondary)',
                  border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                }}
              >
                <User className="h-4 w-4" />
                Promijeni izvršioca
              </button>
            )}

            {/* Vrati u planiranje (samo za aktivne) */}
            {jeAktivna && (
              <button
                type="button"
                onClick={onVratiUFazu}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgba(217,119,6,0.06)',
                  color: '#D97706',
                  border: '1px solid rgba(217,119,6,0.2)',
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Vrati na planiranje
              </button>
            )}
          </div>
        </div>

        {/* Historija - uvijek vidljiva u sidebaru (desktop) */}
        <div className="max-h-[min(480px,50vh)] overflow-y-auto">
          <HistorijaAktivnostiSekcija
            aktivnosti={aktivnosti}
            ucitava={ucitavaAktivnosti}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function DispecerIntervencijaDetaljiPage() {
  const { id } = useParams<{ id: string }>();

  const [zahtjev, setZahtjev] = useState<IntervencijaDetalji | null>(null);
  const [evidencije, setEvidencije] = useState<WorkEvidence[]>([]);
  const [aktivnosti, setAktivnosti] = useState<InterventionActivity[]>([]);
  const [slikeIzBaze, setSlikeIzBaze] = useState<string[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [pokaziVrati, setPokaziVrati] = useState(false);
  const [pokaziPromjenaIzvrsioca, setPokaziPromjenaIzvrsioca] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [closureCheck, setClosureCheck] = useState(false);
  const [closureSlanje, setClosureSlanje] = useState(false);
  const [closureGreska, setClosureGreska] = useState<string | null>(null);

  async function ucitaj() {
    setUcitava(true);
    setGreska(null);
    try {
      const [intR, slikeR] = await Promise.all([
        fetch(`/api/dispecer/zahtjevi/${id}`, { cache: 'no-store' }),
        fetch(`/api/slike?zahtjev_id=${id}`, { cache: 'no-store' }),
      ]);
      const d = await intR.json();
      if (!intR.ok) throw new Error(d.error ?? 'Intervencija nije pronađena.');
      setZahtjev(d.zahtjev);
      setEvidencije(d.evidencije ?? []);
      setAktivnosti(d.aktivnosti ?? []);
      if (slikeR.ok) {
        const slikeD = await slikeR.json();
        setSlikeIzBaze(
          (slikeD.slike ?? []).map((s: { image_url: string }) => s.image_url),
        );
      }
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju.');
    } finally {
      setUcitava(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    ucitaj();
  }, [id]);

  if (ucitava) {
    return (
      <AppShell uloga="dispecer">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Učitavanje intervencije...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (greska || !zahtjev) {
    return (
      <AppShell uloga="dispecer">
        <AlertMessage
          variant="error"
          message={greska ?? 'Intervencija nije pronađena.'}
        />
        <Link href="/dispecer/intervencije">
          <Button variant="secondary" size="md" className="mt-4">
            <ArrowLeft className="h-4 w-4" />
            Nazad
          </Button>
        </Link>
      </AppShell>
    );
  }

  async function zatvoriFormalnoIntervenciju() {
    if (!closureCheck) return;
    setClosureSlanje(true);
    setClosureGreska(null);
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'zatvoriFormalno',
          closure_note: closureNote.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri zatvaranju.');
      await ucitaj();
    } catch (e) {
      setClosureGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setClosureSlanje(false);
    }
  }

  const kat = labelKategorije(zahtjev);
  const naslov = kat.podkategorija ? `${kat.podkategorija}` : kat.glavna;
  const pboja = prioritetBoja(zahtjev.final_priority);
  const sboja = statusBoja(zahtjev.status);
  const jeHitna =
    (zahtjev.urgency_score ?? 0) >= 75 || Boolean(zahtjev.is_premium);
  const kasni = jeKasni(zahtjev);
  const jeAktivna = ['u_radu', 'u_izvrsenju'].includes(zahtjev.status);
  const slike = [...pokupiSlike(zahtjev), ...slikeIzBaze];

  return (
    <AppShell uloga="dispecer">
      {/* ─── Navigacija i naslov ────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--first-nonary)' }}
        >
          <Link
            href="/dispecer"
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:bg-black/[0.04]"
            style={{ color: 'var(--first-secondary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kontrolna ploča
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/dispecer/intervencije"
            className="rounded-lg px-2 py-1 transition-all hover:bg-black/[0.04]"
            style={{ color: 'var(--first-secondary)' }}
          >
            Intervencije
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span
            className="font-bold"
            style={{ color: 'var(--first-octonary)' }}
          >
            #{zahtjev.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={ucitaj}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-black/[0.05]"
            title="Osvježi"
          >
            <RefreshCw
              className="h-4 w-4"
              style={{ color: 'var(--first-nonary)' }}
            />
          </button>
          <Link
            href={`/dispecer/zahtjevi/${zahtjev.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            <ClipboardList className="h-4 w-4" />
            {zahtjev.status === 'zavrseno'
              ? 'Pregled obrade'
              : 'Obrada zahtjeva'}
          </Link>
        </div>
      </div>

      {/* ─── HERO KARTICA ───────────────────────────────────────────────────── */}
      <div
        className="mb-5 overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'rgb(255 255 255/0.92)',
          border: `1px solid ${jeHitna ? 'rgba(220,38,38,0.2)' : 'rgb(var(--first-quaternary-rgb)/0.28)'}`,
          borderLeftWidth: '5px',
          borderLeftColor: jeHitna ? '#DC2626' : pboja,
        }}
      >
        <div className="px-6 py-5">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
              style={{
                backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.22)',
                color: 'var(--first-nonary)',
              }}
            >
              #{zahtjev.id}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: `${sboja}12`,
                color: sboja,
                border: `1.5px solid ${sboja}28`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: sboja }}
              />
              {statusOznaka(zahtjev.status)}
              {jeAktivna && <Radio className="h-3 w-3 animate-pulse" />}
            </span>
            {zahtjev.final_priority && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${pboja}10`,
                  color: pboja,
                  border: `1px solid ${pboja}25`,
                }}
              >
                <Zap className="h-3 w-3" />
                {zahtjev.final_priority}
              </span>
            )}
            {zahtjev.is_premium && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                <Shield className="h-3 w-3" />
                Premium
              </span>
            )}
            <PonovniCiklusBadge broj={zahtjev.broj_ponovnih_ciklusa ?? 0} />
            {kasni && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                <AlertTriangle className="h-3 w-3" />
                Kasni
              </span>
            )}
          </div>

          {/* Naslov i kategorija */}
          <h1
            className="text-xl font-black leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {naslov}
          </h1>
          {kat.podkategorija && (
            <p
              className="mt-0.5 text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              {kat.glavna}
            </p>
          )}

          {/* Meta red */}
          <div
            className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            {zahtjev.serviser && (
              <div className="flex items-center gap-1.5">
                <Wrench
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{ color: 'var(--first-secondary)' }}
                />
                <span
                  className="font-medium"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {zahtjev.serviser.ime} {zahtjev.serviser.prezime}
                </span>
              </div>
            )}
            {zahtjev.termin_planirani_pocetak && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {fmtDatumVrijeme(zahtjev.termin_planirani_pocetak)}
                {zahtjev.termin_planirani_kraj && (
                  <span>- {fmtSat(zahtjev.termin_planirani_kraj)}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1 max-w-xs">{zahtjev.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Prijavljeno {fmtDatumVrijeme(zahtjev.created_at)}</span>
            </div>
          </div>

          {kasni && (
            <div
              className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              <CircleAlert
                className="h-4 w-4 flex-shrink-0"
                style={{ color: '#DC2626' }}
              />
              <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                Intervencija kasni - planirani termin je prošao a status još
                nije ažuriran
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Workflow tracker ────────────────────────────────────────────────── */}
      <WorkflowTracker
        status={zahtjev.status}
        terminPocetak={zahtjev.termin_planirani_pocetak}
        aktivnosti={aktivnosti}
      />

      <HistorijaAktivnostiSekcija
        aktivnosti={aktivnosti}
        ucitava={ucitava}
        className="mb-2"
      />

      {/* ─── Dvostupčani layout ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ── Glavni sadržaj ─────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {/* Vremenski tok (planirano vs stvarno) */}
          <VremenjiTok zahtjev={zahtjev} aktivnosti={aktivnosti} />

          {/* Time-on-task (samo za aktivne) */}
          {jeAktivna && (
            <TimeOnTask
              terminPocetak={zahtjev.termin_planirani_pocetak}
              procijenjeno={zahtjev.procijenjeno_trajanje}
              status={zahtjev.status}
            />
          )}

          {/* Incident kartica - opis problema */}
          <SekcijaKartica Ikona={MessageSquare} naslov="Opis problema">
            <div
              className="rounded-xl border-l-4 px-5 py-4"
              style={{
                borderLeftColor: 'var(--first-secondary)',
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.04)',
              }}
            >
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: 'var(--first-octonary)' }}
              >
                {zahtjev.description}
              </p>
            </div>
            {zahtjev.category_main && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="rounded-md px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                    color: 'var(--first-secondary)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.15)',
                  }}
                >
                  {zahtjev.category_main}
                </span>
                {zahtjev.category_sub && (
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
                      color: 'var(--first-nonary)',
                      border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
                    }}
                  >
                    {zahtjev.category_sub}
                  </span>
                )}
              </div>
            )}
          </SekcijaKartica>

          {/* Komunikacija dispečer ↔ serviser */}
          <NapomeneThread
            aktivnosti={aktivnosti}
            apiEndpoint={`/api/dispecer/zahtjevi/${zahtjev.id}`}
            mojaUloga="dispecer"
            onDodana={ucitaj}
          />

          {/* Operativna instrukcija dispečera */}
          {zahtjev.dispecer_napomene && (
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: 'rgba(217,132,0,0.04)',
                border: '1px solid rgba(217,132,0,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(217,132,0,0.12)' }}
                >
                  <AlertTriangle
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-senary)' }}
                  />
                </div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-senary)' }}
                >
                  Operativna instrukcija
                </p>
              </div>
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: 'var(--first-octonary)' }}
              >
                {zahtjev.dispecer_napomene}
              </p>
            </div>
          )}

          {/* Servisni log - evidencija rada */}
          {evidencije.length > 0 && (
            <SekcijaKartica
              Ikona={Wrench}
              naslov={`Servisni log (${evidencije.length} unos${evidencije.length > 1 ? 'a' : ''})`}
            >
              <div className="flex flex-col gap-3">
                {evidencije.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)',
                      backgroundColor: 'rgb(var(--first-quinary-rgb)/0.1)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p
                        className="text-sm font-medium leading-relaxed"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        {e.opis_rada}
                      </p>
                      <span
                        className="text-[10px] tabular-nums flex-shrink-0"
                        style={{ color: 'var(--first-nonary)' }}
                      >
                        {new Date(e.created_at).toLocaleDateString('bs-BA')}
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      {e.trajanje_minuta && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {trajanjeLabel(e.trajanje_minuta)}
                        </span>
                      )}
                      {e.materijal && (
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {e.materijal}
                        </span>
                      )}
                      {(e.stavke_materijala?.length ?? 0) > 0 && (
                        <span>
                          Stavke:{' '}
                          {e
                            .stavke_materijala!.map(
                              (s) => `${s.naziv} (${s.kolicina} ${s.jedinica})`,
                            )
                            .join(', ')}
                        </span>
                      )}
                      {e.napomene && (
                        <span className="italic">{e.napomene}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SekcijaKartica>
          )}

          {/* Foto dokumentacija */}
          <SekcijaKartica
            Ikona={ImageIcon}
            naslov={
              slike.length > 0
                ? `Foto dokumentacija (${slike.length})`
                : 'Foto dokumentacija'
            }
          >
            <ImageGallery slike={slike} />
          </SekcijaKartica>

          {/* Upload slika (dispečer) */}
          <SekcijaKartica Ikona={Upload} naslov="Dodaj foto dokumentaciju">
            <ImageUploader
              zahtjevId={zahtjev.id}
              onUspjeh={() => void ucitaj()}
            />
          </SekcijaKartica>

          {/* Formalno zatvaranje */}
          {zahtjev.status === 'zavrseno' && !zahtjev.closed_at && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '2px solid rgba(16,37,65,0.2)',
                backgroundColor: 'rgb(255 255 255/0.92)',
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
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Nakon zatvaranja intervencija postaje read-only i prelazi u
                  arhiv.
                </p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {evidencije.length === 0 && (
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
                      Zatvaranje nije moguće - serviser još nije evidentirao
                      obavljeni rad.
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
                    value={closureNote}
                    onChange={(e) => setClosureNote(e.target.value)}
                    disabled={evidencije.length === 0}
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
                    checked={closureCheck}
                    onChange={(e) => setClosureCheck(e.target.checked)}
                    disabled={evidencije.length === 0}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded"
                  />
                  <p
                    className="text-sm font-semibold leading-relaxed"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    Potvrđujem da je intervencija pregledana i da je obavljeni
                    posao dokumentovan. Intervencija je spremna za formalno
                    zatvaranje.
                  </p>
                </label>
                {closureGreska && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: '#DC2626' }}
                  >
                    {closureGreska}
                  </p>
                )}
                <button
                  type="button"
                  onClick={zatvoriFormalnoIntervenciju}
                  disabled={
                    !closureCheck || evidencije.length === 0 || closureSlanje
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--first-primary)',
                    color: '#fff',
                  }}
                >
                  <Lock className="h-4 w-4" />
                  {closureSlanje ? 'Zatvaranje...' : 'Zatvori intervenciju'}
                </button>
              </div>
            </div>
          )}

          {/* Zatvorena - read-only badge */}
          {zahtjev.status === 'zavrseno' && zahtjev.closed_at && (
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                backgroundColor: 'rgb(var(--first-primary-rgb)/0.04)',
                border: '2px solid rgb(var(--first-primary-rgb)/0.18)',
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--first-primary)' }}
              >
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p
                  className="font-bold"
                  style={{ color: 'var(--first-primary)' }}
                >
                  Intervencija je formalno zatvorena
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  {zahtjev.closed_at
                    ? `Zatvoreno ${new Date(zahtjev.closed_at).toLocaleString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : 'Arhivirano'}
                  {zahtjev.closure_note ? ` - ${zahtjev.closure_note}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Desni operativni panel ─────────────────────────────────────── */}
        <DesniPanel
          zahtjev={zahtjev}
          sboja={sboja}
          aktivnosti={aktivnosti}
          ucitavaAktivnosti={ucitava}
          onVratiUFazu={() => setPokaziVrati(true)}
          onPromijeniIzvrsioca={() => setPokaziPromjenaIzvrsioca(true)}
        />
      </div>

      {/* ─── Modali ─────────────────────────────────────────────────────────── */}
      {pokaziVrati && (
        <VratiUFazuModal
          zahtjevId={zahtjev.id}
          onZatvori={() => setPokaziVrati(false)}
        />
      )}
      {pokaziPromjenaIzvrsioca && (
        <PromijeniIzvrsiocaModal
          zahtjevId={zahtjev.id}
          trenutniServIserId={zahtjev.serviser_dodijeljen_id}
          onZatvori={() => setPokaziPromjenaIzvrsioca(false)}
          onUspjeh={ucitaj}
        />
      )}

      {/* ─── Mobile akcije ──────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          backgroundColor: 'rgb(255 255 255/0.97)',
          borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          {zahtjev.serviser?.broj_telefona && (
            <a
              href={`tel:${zahtjev.serviser.broj_telefona}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                color: 'var(--first-secondary)',
                border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
              }}
            >
              <PhoneCall className="h-4 w-4" />
              Serviser
            </a>
          )}
          {zahtjev.podnosilac?.broj_telefona && (
            <a
              href={`tel:${zahtjev.podnosilac.broj_telefona}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
                color: 'var(--first-nonary)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
              }}
            >
              <Phone className="h-4 w-4" />
              Korisnik
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zahtjev.address ?? '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            <Navigation className="h-4 w-4" />
            Mapa
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </AppShell>
  );
}
