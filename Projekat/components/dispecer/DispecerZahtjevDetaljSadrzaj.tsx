'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  Wrench,
  Star,
  Briefcase,
  Zap,
  Shield,
  ChevronRight,
  RotateCcw,
  Info,
  TrendingUp,
} from 'lucide-react';
import type { PreporukaServisera } from '@/lib/servisirane/preporukaServisera';
import { scoreBojaHex } from '@/lib/servisirane/preporukaServisera';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { Button } from '@/components/ui/Button';
import { MiniMapa } from '@/components/shared/MiniMapa';
import { DispecerPregledTokaBadzevi } from '@/components/dispecer/DispecerPregledTokaBadzevi';
import { ZahtjevKorisnickaPorukaBubble } from '@/components/servisirane/ZahtjevTimelineIPoruka';
import { PremiumHitnaBadge } from '@/components/servisirane/zahtjevBadgeovi';
import type {
  ServisniZahtjev,
  ServiserZaDodjelu,
} from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  formatPrijavljenoDatumVrijeme,
  hrefZaTelefon,
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  sviPreferinaniTermini,
  uRecenicu,
} from '@/lib/servisirane/zahtjevPrikaz';
import { urlsPrilozenihSlika } from '@/lib/servisirane/slikeZahtjeva';
import { premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta } from '@/lib/servisirane/operativniPrioritet';
import { dispecerSmijeMijenjatiOperativniPrioritet } from '@/lib/servisirane/statusZahtjeva';
import { efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import { oznakaZaDispecerskiPrikazBroja } from '@/lib/servisirane/korisnickiBrojZahtjeva';

// ─── Types ────────────────────────────────────────────────────────────────────

type ZahtjevDetalj = ServisniZahtjev & {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
};

type NivoOp = 'NISKO' | 'SREDNJE' | 'VISOKO' | 'KRITIČNO' | 'HITNO';

interface SlotDef {
  id: string;
  naziv: string;
  opis: string;
  od: string;
  do: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KORACI = [
  { kljuc: 'pregled', naziv: 'Pregled' },
  { kljuc: 'prioritet', naziv: 'Prioritet' },
  { kljuc: 'termin', naziv: 'Termin i serviser' },
  { kljuc: 'nalog', naziv: 'Pregled naloga' },
  { kljuc: 'potvrda', naziv: 'Potvrda' },
] as const;

const PRIORITETI = [
  {
    kljuc: 'NISKO' as NivoOp,
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb)/0.08)',
    opis: 'Standardna intervencija, bez posebne hitnosti',
  },
  {
    kljuc: 'SREDNJE' as NivoOp,
    boja: '#D97706',
    pozadina: 'rgba(217,119,6,0.08)',
    opis: 'Umjerena hitnost, riješiti u roku radnog dana',
  },
  {
    kljuc: 'VISOKO' as NivoOp,
    boja: '#EA580C',
    pozadina: 'rgba(234,88,12,0.08)',
    opis: 'Povećana hitnost, riješiti što brže moguće',
  },
  {
    kljuc: 'KRITIČNO' as NivoOp,
    boja: '#991B1B',
    pozadina: 'rgba(153,27,27,0.08)',
    opis: 'Kritično stanje, odmah dodijeliti servisera',
  },
  {
    kljuc: 'HITNO' as NivoOp,
    boja: '#DC2626',
    pozadina: 'rgba(220,38,38,0.08)',
    opis: 'Premium hitna intervencija - momentalna reakcija',
  },
] as const;

const PRIORITETI_RANG: Record<NivoOp, number> = {
  NISKO: 1,
  SREDNJE: 2,
  VISOKO: 3,
  KRITIČNO: 4,
  HITNO: 5,
};

const SLOTOVI: SlotDef[] = [
  {
    id: 'jutro',
    naziv: 'Jutarnji',
    opis: '08:00 - 12:00',
    od: '08:00',
    do: '12:00',
  },
  {
    id: 'poslijepodne',
    naziv: 'Poslijepodnevni',
    opis: '12:00 - 16:00',
    od: '12:00',
    do: '16:00',
  },
  {
    id: 'vece',
    naziv: 'Večernji',
    opis: '16:00 - 20:00',
    od: '16:00',
    do: '20:00',
  },
  {
    id: 'cijeli_dan',
    naziv: 'Cijeli dan',
    opis: '08:00 - 20:00',
    od: '08:00',
    do: '20:00',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function preporuciPrioritet(z: ZahtjevDetalj): NivoOp {
  if (z.is_premium) return 'HITNO';
  const s = z.urgency_score ?? 0;
  if (s >= 80) return 'HITNO';
  if (s >= 60) return 'KRITIČNO';
  if (s >= 40) return 'VISOKO';
  if (s >= 20) return 'SREDNJE';
  return 'NISKO';
}

function inicijalniPrioritet(z: ZahtjevDetalj): NivoOp {
  const fp = z.final_priority?.trim();
  if (fp && fp in PRIORITETI_RANG) return fp as NivoOp;
  return preporuciPrioritet(z);
}

function izracunajDostignutiKorak(z: ZahtjevDetalj): number {
  const fin = ['potvrdeno', 'dodijeljeno', 'u_radu', 'u_izvrsenju', 'zavrseno'];
  if (fin.includes(z.status)) return 4;
  if (z.serviser_dodijeljen_id) return 3;
  if (z.final_priority?.trim()) return 2;
  return 0;
}

/**
 * Za zahtjeve sa statusom `potvrdeno` i postavljenim prioritetom, dispečer treba samo dodijeliti servisera —
 * preskočimo direktno na korak 2 (Termin i serviser).
 * Vrijedi i kad je serviser odbio (serviser_odbio_razlog) i kad je zahtjev potvrđen bez dodjele.
 */
function inicijalniAktivniKorak(z: ZahtjevDetalj): number {
  if (z.status === 'potvrdeno' && z.final_priority?.trim()) {
    return 2;
  }
  return 0;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function urgencyBoja(score: number): string {
  if (score >= 75) return '#DC2626';
  if (score >= 50) return '#EA580C';
  if (score >= 25) return '#D97706';
  return 'var(--first-secondary)';
}

function urgencyLabel(score: number): string {
  if (score >= 75) return 'Kritična hitnost';
  if (score >= 50) return 'Visoka hitnost';
  if (score >= 25) return 'Srednja hitnost';
  return 'Niska hitnost';
}

// ─── SlikeDugme ───────────────────────────────────────────────────────────────

function SlikeDugme({ slike }: { slike: string[] }) {
  const [odabrana, setOdabrana] = useState<string | null>(null);
  if (!slike.length)
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgb(var(--first-quinary-rgb)/0.4)' }}
        >
          <ImageIcon
            className="h-5 w-5"
            style={{ color: 'var(--first-quinary)' }}
          />
        </div>
        <p
          className="text-xs font-medium"
          style={{ color: 'var(--first-nonary)' }}
        >
          Nema priloženih slika
        </p>
      </div>
    );
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slike.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOdabrana(url)}
            className="group relative aspect-square overflow-hidden rounded-xl border transition hover:shadow-md"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Slika ${i + 1}`}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <ExternalLink className="h-4 w-4 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>
      {odabrana && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setOdabrana(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={odabrana}
              alt="Pregled slike"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setOdabrana(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── WizardStepper ────────────────────────────────────────────────────────────

function WizardStepper({
  aktivni,
  dostupnoDoInkluzivno,
  onKlik,
}: {
  aktivni: number;
  dostupnoDoInkluzivno: number;
  onKlik: (i: number) => void;
}) {
  return (
    <div className="mb-6 flex items-start">
      {KORACI.map((k, i) => {
        const done = i < aktivni;
        const active = i === aktivni;
        const future = i > aktivni;
        const dostupno = i <= dostupnoDoInkluzivno;
        const last = i === KORACI.length - 1;
        return (
          <div key={k.kljuc} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className="h-0.5 flex-1 transition-colors duration-300"
                  style={{
                    backgroundColor:
                      done || active
                        ? 'var(--first-secondary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.28)',
                  }}
                />
              )}
              <button
                type="button"
                disabled={!dostupno}
                onClick={() => dostupno && onKlik(i)}
                className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all focus:outline-none"
                style={{
                  backgroundColor: done
                    ? 'var(--first-secondary)'
                    : active
                      ? 'var(--first-primary)'
                      : 'rgb(var(--first-quinary-rgb)/0.45)',
                  color: done || active ? '#fff' : 'var(--first-nonary)',
                  boxShadow: active
                    ? '0 0 0 4px rgb(var(--first-primary-rgb)/0.18)'
                    : 'none',
                  cursor: dostupno ? 'pointer' : 'default',
                  opacity: future && !dostupno ? 0.45 : 1,
                }}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
              </button>
              {!last && (
                <div
                  className="h-0.5 flex-1 transition-colors duration-300"
                  style={{
                    backgroundColor: done
                      ? 'var(--first-secondary)'
                      : 'rgb(var(--first-quaternary-rgb)/0.28)',
                  }}
                />
              )}
            </div>
            <span
              className="mt-2 hidden text-center text-[11px] font-semibold leading-tight sm:block"
              style={{
                color: active
                  ? 'var(--first-primary)'
                  : done
                    ? 'var(--first-secondary)'
                    : 'var(--first-nonary)',
                opacity: future && !dostupno ? 0.5 : 1,
              }}
            >
              {k.naziv}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SummarniPanel ────────────────────────────────────────────────────────────

function SummarniPanel({
  zahtjev,
  prioritet,
  odabraniServiser,
  odabraniDatum,
  odabraniSlot,
}: {
  zahtjev: ZahtjevDetalj;
  prioritet: NivoOp;
  odabraniServiser: ServiserZaDodjelu | null;
  odabraniDatum: string;
  odabraniSlot: SlotDef | null;
}) {
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const pDef = PRIORITETI.find((p) => p.kljuc === prioritet)!;
  const score = efektivniKorisnickiUrgencyScore(zahtjev);
  const imePrezime = imePrezimePodnosioca(zahtjev.podnosilac);
  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev, {
    dispecerskiPregled: true,
  });
  const sviTermini = sviPreferinaniTermini(zahtjev);

  function Red({
    Ikona,
    label,
    children,
  }: {
    Ikona: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <div
        className="flex items-start gap-2.5 py-2.5"
        style={{
          borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.18)',
        }}
      >
        <Ikona
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
          style={{ color: 'var(--first-quinary)' }}
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-quinary)' }}
          >
            {label}
          </p>
          <div
            className="mt-0.5 text-xs font-semibold leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-2xl lg:w-72 xl:w-80 lg:flex-shrink-0 lg:sticky lg:top-4"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.3)',
      }}
    >
      <div
        className="px-4 py-3.5"
        style={{ backgroundColor: 'var(--first-primary)' }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Sažetak naloga
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">
          #{oznakaZaDispecerskiPrikazBroja(zahtjev)}
        </p>
        <p
          className="mt-0.5 truncate text-xs"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          {podkategorija || glavna}
        </p>
      </div>
      <div className="px-4 py-1">
        <Red Ikona={User} label="Korisnik">
          {imePrezime || '-'}
        </Red>
        <Red Ikona={MapPin} label="Adresa">
          <span className="line-clamp-2">{zahtjev.address || '-'}</span>
        </Red>
        <Red Ikona={Calendar} label="Prijavljeno">
          {formatPrijavljenoDatumVrijeme(zahtjev.created_at)}
        </Red>
        <Red Ikona={Clock} label="Pref. termini">
          {sviTermini.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {sviTermini.map((t, i) => (
                <span key={i}>
                  <span
                    className="font-normal"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {t.tip}:{' '}
                  </span>
                  {t.datum}
                  {t.od && t.do ? `, ${t.od}-${t.do}` : ''}
                </span>
              ))}
            </div>
          ) : (
            terminTekst || '-'
          )}
        </Red>
        <Red Ikona={Zap} label="Hitnost korisnika">
          <span style={{ color: urgencyBoja(score) }}>
            {urgencyLabel(score)} ({score})
          </span>
        </Red>
        {zahtjev.is_premium && (
          <div
            className="flex items-center gap-1.5 py-2.5"
            style={{
              borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.18)',
            }}
          >
            <Shield className="h-3.5 w-3.5" style={{ color: '#DC2626' }} />
            <span className="text-xs font-bold" style={{ color: '#DC2626' }}>
              Premium korisnik
            </span>
          </div>
        )}
        <div
          className="py-2.5"
          style={{
            borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.18)',
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--first-quinary)' }}
          >
            Op. prioritet
          </p>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              backgroundColor: pDef.pozadina,
              color: pDef.boja,
              border: `1px solid ${pDef.boja}28`,
            }}
          >
            {prioritet}
          </span>
        </div>
        {odabraniServiser && (
          <div
            className="py-2.5"
            style={{
              borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.18)',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-1.5"
              style={{ color: 'var(--first-quinary)' }}
            >
              Serviser
            </p>
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
                }}
              >
                <Wrench
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--first-secondary)' }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {odabraniServiser.ime} {odabraniServiser.prezime}
              </span>
            </div>
          </div>
        )}
        {odabraniDatum && odabraniSlot && (
          <div className="py-2.5">
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: 'var(--first-quinary)' }}
            >
              Planirani termin
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              {fmtDatum(odabraniDatum + 'T00:00:00')}
            </p>
            <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              {odabraniSlot.opis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KORAK 1 - Pregled zahtjeva ───────────────────────────────────────────────

function KorakPregled({ zahtjev }: { zahtjev: ZahtjevDetalj }) {
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const score = efektivniKorisnickiUrgencyScore(zahtjev);
  const imePrezime = imePrezimePodnosioca(zahtjev.podnosilac);
  const telefon =
    zahtjev.podnosilac?.broj_telefona?.trim() ||
    zahtjev.contact_phone?.trim() ||
    '';
  const telefonHref = telefon ? hrefZaTelefon(telefon) : null;
  const opis = uRecenicu((zahtjev.description ?? '').trim());
  const slike = urlsPrilozenihSlika(
    zahtjev as ZahtjevDetalj & Record<string, unknown>,
  );
  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev, {
    dispecerskiPregled: true,
  });
  const sviTerminiKorak = sviPreferinaniTermini(zahtjev);

  const sekcija = {
    backgroundColor: 'rgb(var(--first-quinary-rgb)/0.12)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
  };

  return (
    <div className="space-y-4">
      {/* Top 3 info cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Korisnik */}
        <div className="rounded-2xl p-4" style={sekcija}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
              }}
            >
              <User
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Korisnik
            </p>
          </div>
          <p
            className="font-bold leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {imePrezime || '-'}
          </p>
          {telefon ? (
            <a
              href={telefonHref ?? '#'}
              className="mt-1 flex items-center gap-1 text-sm font-medium hover:opacity-70"
              style={{ color: 'var(--first-secondary)' }}
            >
              <Phone className="h-3 w-3" />
              {telefon}
            </a>
          ) : (
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              -
            </p>
          )}
          {zahtjev.is_premium && (
            <div className="mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" style={{ color: '#DC2626' }} />
              <span
                className="text-[11px] font-bold"
                style={{ color: '#DC2626' }}
              >
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Hitnost + Termin */}
        <div className="rounded-2xl p-4" style={sekcija}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
            >
              <Zap
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Hitnost
            </p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-8 flex-1 overflow-hidden rounded-lg"
              style={{
                backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.2)',
              }}
            >
              <div
                className="h-full rounded-lg transition-all"
                style={{
                  width: `${score}%`,
                  backgroundColor: urgencyBoja(score),
                }}
              />
            </div>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: urgencyBoja(score) }}
            >
              {score}
            </span>
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: urgencyBoja(score) }}
          >
            {urgencyLabel(score)}
          </p>
          <div
            className="mt-3 pt-3"
            style={{
              borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: 'var(--first-nonary)' }}
            >
              Termini korisnika
            </p>
            {sviTerminiKorak.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {sviTerminiKorak.map((t, i) => (
                  <p
                    key={i}
                    className="text-xs"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    <span className="font-semibold">{t.tip}:</span> {t.datum}
                    {t.od && t.do ? `, ${t.od}-${t.do}` : ''}
                  </p>
                ))}
              </div>
            ) : (
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--first-octonary)' }}
              >
                {terminTekst || '-'}
              </p>
            )}
          </div>
        </div>

        {/* Datum prijave + Kategorija */}
        <div className="rounded-2xl p-4" style={sekcija}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
            >
              <FileText
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Zahtjev
            </p>
          </div>
          <p
            className="font-bold leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {podkategorija || glavna}
          </p>
          {podkategorija && (
            <p
              className="mt-0.5 text-xs"
              style={{ color: 'var(--first-nonary)' }}
            >
              {glavna}
            </p>
          )}
          <div
            className="mt-3 pt-3"
            style={{
              borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: 'var(--first-nonary)' }}
            >
              Prijavljeno
            </p>
            <p
              className="text-xs font-medium"
              style={{ color: 'var(--first-octonary)' }}
            >
              {formatPrijavljenoDatumVrijeme(zahtjev.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Lokacija + Mapa */}
      <div className="rounded-2xl p-4" style={sekcija}>
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
          >
            <MapPin
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-secondary)' }}
            />
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Lokacija intervencije
          </p>
        </div>
        <MiniMapa
          adresa={zahtjev.address ?? ''}
          lat={zahtjev.latitude}
          lng={zahtjev.longitude}
          visina={160}
        />
      </div>

      {/* Opis */}
      <div className="rounded-2xl p-4" style={sekcija}>
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
          >
            <MessageSquare
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-secondary)' }}
            />
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Opis problema
          </p>
        </div>
        {opis ? (
          <ZahtjevKorisnickaPorukaBubble tekst={opis} className="mt-0 mb-0" />
        ) : (
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
            Korisnik nije ostavio opis.
          </p>
        )}
      </div>

      {/* Slike */}
      <div className="rounded-2xl p-4" style={sekcija}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
            >
              <ImageIcon
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Priložene slike {slike.length > 0 && `(${slike.length})`}
            </p>
          </div>
        </div>
        <SlikeDugme slike={slike} />
      </div>
    </div>
  );
}

// ─── KORAK 2 - Operativni prioritet ───────────────────────────────────────────

function KorakPrioritet({
  zahtjev,
  prioritet,
  setPrioritet,
  downgradeRazlog,
  setDowngradeRazlog,
  mozeMijenjati,
}: {
  zahtjev: ZahtjevDetalj;
  prioritet: NivoOp;
  setPrioritet: (p: NivoOp) => void;
  downgradeRazlog: string;
  setDowngradeRazlog: (s: string) => void;
  mozeMijenjati: boolean;
}) {
  const preporuceni = preporuciPrioritet(zahtjev);
  const score = efektivniKorisnickiUrgencyScore(zahtjev);
  const jeSmanjenje = PRIORITETI_RANG[prioritet] < PRIORITETI_RANG[preporuceni];
  const trebaPremium =
    zahtjev.is_premium &&
    premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(prioritet);
  const prikaziRazlog = mozeMijenjati && (jeSmanjenje || trebaPremium);

  return (
    <div className="space-y-5">
      {/* Context row */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
            border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
          }}
        >
          <DispecerPregledTokaBadzevi zahtjev={zahtjev} />
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.28)',
            border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
          }}
        >
          <Zap className="h-3.5 w-3.5" style={{ color: urgencyBoja(score) }} />
          <span
            className="text-xs font-bold"
            style={{ color: urgencyBoja(score) }}
          >
            {urgencyLabel(score)} - {score}
          </span>
        </div>
      </div>

      {/* Info */}
      <div
        className="flex items-start gap-2.5 rounded-xl px-4 py-3"
        style={{
          backgroundColor: 'rgb(var(--first-secondary-rgb)/0.05)',
          border: '1px solid rgb(var(--first-secondary-rgb)/0.15)',
        }}
      >
        <Info
          className="h-4 w-4 flex-shrink-0 mt-0.5"
          style={{ color: 'var(--first-secondary)' }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--first-secondary)' }}
        >
          Sistem preporučuje <strong>{preporuceni}</strong> na osnovu korisničke
          hitnosti i premium statusa.
          {mozeMijenjati
            ? ' Odaberite operativni prioritet klikom na karticu.'
            : ' Operativni prioritet ne može se mijenjati za ovaj status.'}
        </p>
      </div>

      {/* Priority cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PRIORITETI.map((p) => {
          const odabran = prioritet === p.kljuc;
          const jePreporuceni = preporuceni === p.kljuc;
          return (
            <button
              key={p.kljuc}
              type="button"
              disabled={!mozeMijenjati}
              onClick={() => mozeMijenjati && setPrioritet(p.kljuc)}
              className="relative flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-150 focus:outline-none"
              style={{
                backgroundColor: odabran ? p.boja : p.pozadina,
                border: odabran
                  ? `2px solid ${p.boja}`
                  : `1px solid ${p.boja}30`,
                boxShadow: odabran ? `0 4px 20px ${p.boja}28` : 'none',
                cursor: mozeMijenjati ? 'pointer' : 'default',
                transform: odabran ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {jePreporuceni && (
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: p.boja, color: '#fff' }}
                >
                  <Star className="inline h-2.5 w-2.5 mr-0.5" />
                  Preporučeno
                </span>
              )}
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: odabran ? '#fff' : p.boja }}
              />
              <span
                className="text-sm font-black leading-none"
                style={{ color: odabran ? '#fff' : p.boja }}
              >
                {p.kljuc}
              </span>
              <p
                className="text-[10px] leading-tight"
                style={{
                  color: odabran
                    ? 'rgba(255,255,255,0.8)'
                    : 'var(--first-nonary)',
                }}
              >
                {p.opis}
              </p>
              {odabran && (
                <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
              )}
            </button>
          );
        })}
      </div>

      {/* Downgrade justification */}
      {prikaziRazlog && (
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'rgba(220,38,38,0.04)',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: '#DC2626' }} />
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
              {trebaPremium
                ? 'Obavezno obrazloženje (premium zahtjev)'
                : 'Obrazloženje smanjenja prioriteta'}
            </p>
          </div>
          <textarea
            rows={3}
            value={downgradeRazlog}
            onChange={(e) => setDowngradeRazlog(e.target.value)}
            placeholder="Npr. Korisnik označio hitno, ali nema rizika po sigurnost. Problem ne zahtijeva hitan izlazak."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: 'rgba(220,38,38,0.3)',
              backgroundColor: 'rgb(255 255 255/0.9)',
              color: 'var(--first-octonary)',
            }}
          />
        </div>
      )}

      {!mozeMijenjati && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
            border: '1px solid rgb(var(--first-quaternary-rgb)/0.25)',
          }}
        >
          <Info className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
          <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
            Za ovaj status operativni prioritet se ne može mijenjati.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── KORAK 3 - Termin i serviser ──────────────────────────────────────────────

function KorakTerminIServiser({
  zahtjev: _zahtjev,
  odabraniDatum,
  setDatum,
  odabraniSlot,
  setSlot,
  napomene,
  setNapomene,
  preporuke,
  odabraniServiser,
  setServiser,
  ucitavaServisere,
  pomocniServiseri,
  setPomocniServiseri,
  konfliktUpozorenje,
  onOverrideKonflikt,
  odbijeniServiserIds,
}: {
  zahtjev: ZahtjevDetalj;
  odabraniDatum: string;
  setDatum: (s: string) => void;
  odabraniSlot: SlotDef | null;
  setSlot: (s: SlotDef | null) => void;
  napomene: string;
  setNapomene: (s: string) => void;
  preporuke: PreporukaServisera[];
  odabraniServiser: ServiserZaDodjelu | null;
  setServiser: (s: ServiserZaDodjelu | null) => void;
  ucitavaServisere: boolean;
  pomocniServiseri: ServiserZaDodjelu[];
  setPomocniServiseri: (s: ServiserZaDodjelu[]) => void;
  konfliktUpozorenje: null | {
    zahtjev_id: number;
    pocetak: string;
    kraj: string;
  };
  onOverrideKonflikt: () => Promise<void>;
  /** ID-evi servisera koji su prethodno odbili ovaj zahtjev — prikazuju se grayed-out i ne mogu biti odabrani. */
  odbijeniServiserIds?: string[];
}) {
  const serviseri = preporuke.map((p) => p.serviser);
  const sekcija = {
    backgroundColor: 'rgb(var(--first-quinary-rgb)/0.12)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* LEFT: Termin */}
      <div className="flex-1 space-y-4">
        <div className="rounded-2xl p-5" style={sekcija}>
          <div className="mb-4 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
              }}
            >
              <Calendar
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Datum intervencije
            </p>
          </div>
          <input
            type="date"
            min={todayISO()}
            value={odabraniDatum}
            onChange={(e) => setDatum(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
              color: 'var(--first-octonary)',
              backgroundColor: 'rgb(255 255 255/0.9)',
            }}
          />
        </div>

        <div className="rounded-2xl p-5" style={sekcija}>
          <div className="mb-4 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
              }}
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
              Vremenski termin
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {SLOTOVI.map((slot) => {
              const aktivan = odabraniSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlot(aktivan ? null : slot)}
                  className="flex flex-col items-start rounded-xl p-3.5 text-left transition-all"
                  style={{
                    backgroundColor: aktivan
                      ? 'var(--first-secondary)'
                      : 'rgb(255 255 255/0.8)',
                    border: aktivan
                      ? '2px solid var(--first-secondary)'
                      : '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
                    boxShadow: aktivan
                      ? '0 4px 12px rgb(var(--first-secondary-rgb)/0.2)'
                      : 'none',
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: aktivan ? '#fff' : 'var(--first-octonary)',
                    }}
                  >
                    {slot.naziv}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: aktivan
                        ? 'rgba(255,255,255,0.8)'
                        : 'var(--first-nonary)',
                    }}
                  >
                    {slot.opis}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={sekcija}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgb(var(--first-quinary-rgb)/0.4)' }}
            >
              <FileText
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-nonary)' }}
              />
            </div>
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Napomene dispečera
            </p>
          </div>
          <textarea
            rows={3}
            value={napomene}
            onChange={(e) => setNapomene(e.target.value)}
            placeholder="Operativne napomene za servisera - pristup, posebna oprema, kontakt na licu mjesta..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
              backgroundColor: 'rgb(255 255 255/0.9)',
              color: 'var(--first-octonary)',
            }}
          />
        </div>
      </div>

      {/* RIGHT: Serviseri */}
      <div className="lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-4">
        {/* Konflikt upozorenje */}
        {konfliktUpozorenje && (
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: 'rgba(217,119,6,0.05)',
              border: '1px solid rgba(217,119,6,0.3)',
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle
                className="h-4 w-4 flex-shrink-0 mt-0.5"
                style={{ color: '#D97706' }}
              />
              <div>
                <p className="text-sm font-bold" style={{ color: '#D97706' }}>
                  Konflikt termina
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Serviser je već dodijeljen intervenciji #
                  {konfliktUpozorenje.zahtjev_id} u ovom terminu.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOverrideKonflikt}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-85"
              style={{ backgroundColor: '#D97706', color: '#fff' }}
            >
              Svjesno prihvati konflikt
            </button>
          </div>
        )}

        {/* Sekcija 1 - Glavni serviser */}
        <div className="rounded-2xl p-5" style={sekcija}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--first-primary)' }}
              >
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Glavni serviser
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Primarni izvršilac intervencije
                </p>
              </div>
            </div>
          </div>

          {ucitavaServisere ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'var(--first-secondary)' }}
              />
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                Izračunavam preporuke...
              </p>
            </div>
          ) : preporuke.length === 0 ? (
            <p
              className="py-4 text-center text-xs"
              style={{ color: 'var(--first-nonary)' }}
            >
              Nema dostupnih servisera.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {preporuke.map(
                ({ serviser: srv, score, razlozi, jePreporucen }) => {
                  const odabran = odabraniServiser?.id === srv.id;
                  const jePomocni = pomocniServiseri.some(
                    (p) => p.id === srv.id,
                  );
                  const jeOdbijen = (odbijeniServiserIds ?? []).includes(
                    srv.id,
                  );
                  const onemogucen = jePomocni || jeOdbijen;
                  const scoreBoja = scoreBojaHex(score);
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() =>
                        !onemogucen && setServiser(odabran ? null : srv)
                      }
                      disabled={onemogucen}
                      title={
                        jeOdbijen
                          ? 'Serviser je prethodno odbio ovaj zahtjev — nije dostupan za odabir.'
                          : undefined
                      }
                      className="relative flex flex-col gap-2 rounded-xl p-3 text-left transition-all"
                      style={{
                        backgroundColor: jeOdbijen
                          ? 'rgb(var(--first-quinary-rgb)/0.18)'
                          : odabran
                            ? 'rgb(var(--first-primary-rgb)/0.06)'
                            : 'rgb(255 255 255/0.8)',
                        border: jeOdbijen
                          ? '1px solid rgba(220,38,38,0.18)'
                          : odabran
                            ? '2px solid var(--first-primary)'
                            : '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
                        opacity: jeOdbijen ? 0.6 : 1,
                        cursor: onemogucen ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {/* Badge: preporučeno ili prethodno odbio */}
                      {jeOdbijen ? (
                        <div
                          className="absolute -top-2.5 right-2 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{ backgroundColor: '#DC2626', color: '#fff' }}
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Preth. odbio
                        </div>
                      ) : jePreporucen ? (
                        <div
                          className="absolute -top-2.5 right-2 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{
                            backgroundColor: 'var(--first-primary)',
                            color: '#fff',
                          }}
                        >
                          <Star className="h-2.5 w-2.5" />
                          Preporučeno
                        </div>
                      ) : null}

                      {/* Top row: avatar + name + check */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: jeOdbijen
                              ? 'rgba(220,38,38,0.08)'
                              : odabran
                                ? 'var(--first-primary)'
                                : 'rgb(var(--first-quaternary-rgb)/0.28)',
                          }}
                        >
                          <Wrench
                            className="h-3.5 w-3.5"
                            style={{
                              color: jeOdbijen
                                ? '#DC2626'
                                : odabran
                                  ? '#fff'
                                  : 'var(--first-nonary)',
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-bold truncate"
                            style={{
                              color: jeOdbijen
                                ? 'rgb(var(--first-nonary-rgb)/0.7)'
                                : 'var(--first-octonary)',
                            }}
                          >
                            {srv.ime} {srv.prezime}
                            {srv.is_verified && (
                              <Shield
                                className="ml-1 inline h-3 w-3"
                                style={{
                                  color: jeOdbijen
                                    ? 'rgba(0,0,0,0.3)'
                                    : 'var(--first-secondary)',
                                }}
                              />
                            )}
                          </p>
                          {/* Napomena za odbijene */}
                          {jeOdbijen && (
                            <p
                              className="mt-0.5 text-[10px] font-medium leading-tight"
                              style={{ color: '#DC2626' }}
                            >
                              Prethodno odbio — nije dostupan za odabir
                            </p>
                          )}
                        </div>
                        {odabran && !jeOdbijen && (
                          <div
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'var(--first-primary)' }}
                          >
                            <Check
                              className="h-3 w-3 text-white"
                              strokeWidth={2.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* Score bar */}
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className="h-3 w-3 flex-shrink-0"
                          style={{ color: scoreBoja }}
                        />
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{
                            backgroundColor:
                              'rgb(var(--first-quaternary-rgb)/0.25)',
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${score}%`,
                              backgroundColor: scoreBoja,
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-bold tabular-nums w-7 text-right"
                          style={{ color: scoreBoja }}
                        >
                          {score}
                        </span>
                      </div>

                      {/* Reason tags */}
                      {razlozi.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {razlozi.map((r) => (
                            <span
                              key={r}
                              className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                              style={{
                                backgroundColor:
                                  'rgb(var(--first-quaternary-rgb)/0.2)',
                                color: 'var(--first-nonary)',
                              }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* Sekcija 2 - Pomoćni serviseri */}
        <div className="rounded-2xl p-5" style={sekcija}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
              }}
            >
              <Star
                className="h-3.5 w-3.5"
                style={{ color: 'var(--first-secondary)' }}
              />
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Pomoćni serviseri
              </p>
              <p
                className="text-[10px]"
                style={{ color: 'var(--first-nonary)' }}
              >
                Opciono dodatno osoblje
              </p>
            </div>
          </div>

          {/* Lista odabranih pomoćnih */}
          {pomocniServiseri.length > 0 && (
            <div className="mb-3 flex flex-col gap-1.5">
              {pomocniServiseri.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.06)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.18)',
                  }}
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{
                      backgroundColor: 'rgb(var(--first-secondary-rgb)/0.15)',
                      color: 'var(--first-secondary)',
                    }}
                  >
                    {p.ime[0]}
                    {p.prezime[0]}
                  </div>
                  <p
                    className="flex-1 text-xs font-semibold truncate"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {p.ime} {p.prezime}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setPomocniServiseri(
                        pomocniServiseri.filter((x) => x.id !== p.id),
                      )
                    }
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-red-100"
                    style={{ color: '#DC2626' }}
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dodaj iz liste — odbijeni serviseri su isključeni */}
          {serviseri.filter(
            (s) =>
              s.id !== odabraniServiser?.id &&
              !pomocniServiseri.some((p) => p.id === s.id) &&
              !(odbijeniServiserIds ?? []).includes(s.id),
          ).length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {serviseri
                .filter(
                  (s) =>
                    s.id !== odabraniServiser?.id &&
                    !pomocniServiseri.some((p) => p.id === s.id) &&
                    !(odbijeniServiserIds ?? []).includes(s.id),
                )
                .map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() =>
                      setPomocniServiseri([...pomocniServiseri, srv])
                    }
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'rgb(255 255 255/0.8)',
                      border: '1px dashed rgb(var(--first-quaternary-rgb)/0.4)',
                    }}
                  >
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.3)',
                        color: 'var(--first-nonary)',
                      }}
                    >
                      {srv.ime[0]}
                      {srv.prezime[0]}
                    </div>
                    <p
                      className="flex-1 text-xs font-medium truncate"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      {srv.ime} {srv.prezime}
                    </p>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: 'var(--first-secondary)' }}
                    >
                      + Dodaj
                    </span>
                  </button>
                ))}
            </div>
          ) : (
            <p
              className="text-xs text-center py-2"
              style={{ color: 'var(--first-nonary)' }}
            >
              {pomocniServiseri.length > 0
                ? 'Svi serviseri su dodani.'
                : 'Nema dostupnih pomoćnih servisera.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KORAK 4 - Pregled naloga ─────────────────────────────────────────────────

function KorakPregledNaloga({
  zahtjev,
  prioritet,
  odabraniServiser,
  odabraniDatum,
  odabraniSlot,
  napomene,
  onUredi,
}: {
  zahtjev: ZahtjevDetalj;
  prioritet: NivoOp;
  odabraniServiser: ServiserZaDodjelu | null;
  odabraniDatum: string;
  odabraniSlot: SlotDef | null;
  napomene: string;
  onUredi: (korak: number) => void;
}) {
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const imePrezime = imePrezimePodnosioca(zahtjev.podnosilac);
  const telefon =
    zahtjev.podnosilac?.broj_telefona || zahtjev.contact_phone || '';
  const pDef = PRIORITETI.find((p) => p.kljuc === prioritet)!;
  const score = efektivniKorisnickiUrgencyScore(zahtjev);
  const slike = urlsPrilozenihSlika(
    zahtjev as ZahtjevDetalj & Record<string, unknown>,
  );

  function NalogKartica({
    naslov,
    korak,
    children,
  }: {
    naslov: string;
    korak: number;
    children: React.ReactNode;
  }) {
    return (
      <div
        className="relative rounded-2xl p-5 transition-all"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            {naslov}
          </p>
          <button
            type="button"
            onClick={() => onUredi(korak)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition hover:opacity-70"
            style={{
              color: 'var(--first-secondary)',
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Uredi
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NalogKartica naslov="Korisnik" korak={0}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                color: 'var(--first-secondary)',
              }}
            >
              {(imePrezime || '?').charAt(0)}
            </div>
            <div>
              <p
                className="font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {imePrezime || '-'}
              </p>
              {telefon && (
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  {telefon}
                </p>
              )}
              {zahtjev.is_premium && (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold"
                  style={{ color: '#DC2626' }}
                >
                  <Shield className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
          </div>
        </NalogKartica>

        <NalogKartica naslov="Zahtjev" korak={0}>
          <p className="font-bold" style={{ color: 'var(--first-octonary)' }}>
            {podkategorija || glavna}
          </p>
          {podkategorija && (
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--first-nonary)' }}
            >
              {glavna}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Zap
              className="h-3.5 w-3.5"
              style={{ color: urgencyBoja(score) }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: urgencyBoja(score) }}
            >
              {urgencyLabel(score)} ({score})
            </span>
          </div>
          {slike.length > 0 && (
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--first-nonary)' }}
            >
              {slike.length} priložen
              {slike.length === 1 ? 'a slika' : 'e slike'}
            </p>
          )}
        </NalogKartica>

        <NalogKartica naslov="Lokacija" korak={0}>
          <MiniMapa
            adresa={zahtjev.address ?? ''}
            lat={zahtjev.latitude}
            lng={zahtjev.longitude}
            visina={100}
          />
        </NalogKartica>

        <NalogKartica naslov="Operativni prioritet" korak={1}>
          <span
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black"
            style={{
              backgroundColor: pDef.pozadina,
              color: pDef.boja,
              border: `1.5px solid ${pDef.boja}35`,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: pDef.boja }}
            />
            {prioritet}
          </span>
          <p className="mt-2 text-xs" style={{ color: 'var(--first-nonary)' }}>
            {pDef.opis}
          </p>
        </NalogKartica>

        <NalogKartica naslov="Termin" korak={2}>
          {odabraniDatum && odabraniSlot ? (
            <>
              <p
                className="font-bold text-base"
                style={{ color: 'var(--first-octonary)' }}
              >
                {fmtDatum(odabraniDatum + 'T00:00:00')}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--first-secondary)' }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-secondary)' }}
                >
                  {odabraniSlot.opis}
                </p>
              </div>
              <p
                className="mt-1 text-xs"
                style={{ color: 'var(--first-nonary)' }}
              >
                {odabraniSlot.naziv} termin
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#DC2626' }}>
              Termin nije odabran
            </p>
          )}
        </NalogKartica>

        <NalogKartica naslov="Serviser" korak={2}>
          {odabraniServiser ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)',
                }}
              >
                <Wrench
                  className="h-5 w-5"
                  style={{ color: 'var(--first-secondary)' }}
                />
              </div>
              <div>
                <p
                  className="font-bold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {odabraniServiser.ime} {odabraniServiser.prezime}
                  {odabraniServiser.is_verified && (
                    <Shield
                      className="ml-1 inline h-3 w-3"
                      style={{ color: 'var(--first-secondary)' }}
                    />
                  )}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {odabraniServiser.specialnosti.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] rounded px-1.5 py-0.5"
                      style={{
                        backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.3)',
                        color: 'var(--first-nonary)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#DC2626' }}>
              Serviser nije odabran
            </p>
          )}
        </NalogKartica>
      </div>

      {napomene.trim() && (
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
            border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Napomene dispečera
            </p>
            <button
              type="button"
              onClick={() => onUredi(2)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
              style={{
                color: 'var(--first-secondary)',
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
              }}
            >
              <RotateCcw className="h-3 w-3" />
              Uredi
            </button>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--first-octonary)' }}
          >
            {napomene}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── KORAK 5 - Potvrda ────────────────────────────────────────────────────────

function KorakPotvrda({
  zahtjev,
  prioritet,
  odabraniServiser,
  odabraniDatum,
  odabraniSlot,
  potvrdjeno,
  setPotvrdjeno,
  imeDispecera,
}: {
  zahtjev: ZahtjevDetalj;
  prioritet: NivoOp;
  odabraniServiser: ServiserZaDodjelu | null;
  odabraniDatum: string;
  odabraniSlot: SlotDef | null;
  potvrdjeno: boolean;
  setPotvrdjeno: (b: boolean) => void;
  imeDispecera: string;
}) {
  const pDef = PRIORITETI.find((p) => p.kljuc === prioritet)!;
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const imePrezime = imePrezimePodnosioca(zahtjev.podnosilac);
  const sada = new Date();

  return (
    <div className="space-y-5">
      {/* Confirmation hero */}
      <div
        className="flex flex-col items-center gap-4 rounded-2xl py-8 text-center"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.25)',
          }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: '#16A34A' }} />
        </div>
        <div>
          <h3
            className="text-xl font-black"
            style={{ color: 'var(--first-octonary)' }}
          >
            Nalog je spreman za potvrdu
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Provjerite sve detalje i potvrdite operativni nalog
          </p>
        </div>
      </div>

      {/* Summary compact */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)' }}
      >
        {[
          { label: 'Korisnik', value: imePrezime || '-' },
          { label: 'Zahtjev', value: podkategorija || glavna },
          {
            label: 'Prioritet',
            value: (
              <span style={{ color: pDef.boja, fontWeight: 700 }}>
                {prioritet}
              </span>
            ),
          },
          {
            label: 'Serviser',
            value: odabraniServiser ? (
              `${odabraniServiser.ime} ${odabraniServiser.prezime}`
            ) : (
              <span style={{ color: '#DC2626' }}>Nije odabran</span>
            ),
          },
          {
            label: 'Termin',
            value:
              odabraniDatum && odabraniSlot ? (
                `${fmtDatum(odabraniDatum + 'T00:00:00')} - ${odabraniSlot.opis}`
              ) : (
                <span style={{ color: '#DC2626' }}>Nije odabran</span>
              ),
          },
        ].map(({ label, value }, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
            style={{
              borderBottom:
                i < 4
                  ? '1px solid rgb(var(--first-quaternary-rgb)/0.18)'
                  : 'none',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              {label}
            </p>
            <p
              className="text-right text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Dispatcher + timestamp */}
      <div
        className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
        style={{
          backgroundColor: 'rgb(var(--first-secondary-rgb)/0.06)',
          border: '1px solid rgb(var(--first-secondary-rgb)/0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'var(--first-secondary)', color: '#fff' }}
          >
            {imeDispecera.charAt(0)}
          </div>
          <div>
            <p
              className="text-xs font-bold"
              style={{ color: 'var(--first-octonary)' }}
            >
              {imeDispecera}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--first-nonary)' }}>
              Dispečer
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-xs font-bold tabular-nums"
            style={{ color: 'var(--first-octonary)' }}
          >
            {sada.toLocaleDateString('bs-BA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
          <p
            className="text-[11px] tabular-nums"
            style={{ color: 'var(--first-nonary)' }}
          >
            {sada.toLocaleTimeString('bs-BA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label
        className="flex cursor-pointer items-start gap-3.5 rounded-2xl p-5 transition-all"
        style={{
          backgroundColor: potvrdjeno
            ? 'rgb(var(--first-secondary-rgb)/0.06)'
            : 'rgb(var(--first-quinary-rgb)/0.15)',
          border: `2px solid ${potvrdjeno ? 'rgb(var(--first-secondary-rgb)/0.35)' : 'rgb(var(--first-quaternary-rgb)/0.28)'}`,
        }}
      >
        <input
          type="checkbox"
          checked={potvrdjeno}
          onChange={(e) => setPotvrdjeno(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer accent-green-600"
        />
        <p
          className="text-sm font-semibold leading-relaxed"
          style={{ color: 'var(--first-octonary)' }}
        >
          Potvrđujem da su svi podaci provjereni i da je nalog spreman za
          obradu. Preuzimam operativnu odgovornost za dodjelu servisera i termin
          intervencije.
        </p>
      </label>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function DispecerZahtjevDetaljSadrzaj({
  zahtjev,
  requestId,
  onRequestUpdated,
  onOsvjezajDetalj,
  hrefNazad,
  fokusKorakTermin = false,
}: {
  zahtjev: ZahtjevDetalj;
  requestId: string;
  onRequestUpdated?: (zahtjev: ZahtjevDetalj) => void;
  /** Nakon PATCH-a - osvježi i historiju aktivnosti na roditeljskoj stranici. */
  onOsvjezajDetalj?: (payload: {
    zahtjev: ZahtjevDetalj;
    aktivnosti?: import('@/domain/types/servisirane').InterventionActivity[];
  }) => void;
  prikaziDugmeNazad?: boolean;
  hrefNazad?: string;
  fokusKorakTermin?: boolean;
}) {
  const router = useRouter();
  const [aktivniKorak, setAktivniKorakRaw] = useState(() =>
    inicijalniAktivniKorak(zahtjev),
  );
  const [dostignutiKorak, setDostignutiKorak] = useState(() =>
    izracunajDostignutiKorak(zahtjev),
  );
  const [prioritet, setPrioritet] = useState<NivoOp>(() =>
    inicijalniPrioritet(zahtjev),
  );
  const [downgradeRazlog, setDowngradeRazlog] = useState('');
  const [odabraniDatum, setOdabraniDatum] = useState(todayISO);
  const [odabraniSlot, setOdabraniSlot] = useState<SlotDef | null>(null);
  const [napomene, setNapomene] = useState('');
  const [preporuke, setPreporuke] = useState<PreporukaServisera[]>([]);
  const [odbijeniServiserIds, setOdbijeniServiserIds] = useState<string[]>([]);
  const [ucitavaServ, setUcitavaServ] = useState(false);
  const [odabraniServ, setOdabraniServ] = useState<ServiserZaDodjelu | null>(
    null,
  );
  const [potvrdjeno, setPotvrdjeno] = useState(false);
  const [imeDispecera, setImeDispecera] = useState('Dispečer');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [korakGreska, setKorakGreska] = useState<string | null>(null);
  const [dodjelaUspjela, setDodjelaUspjela] = useState(false);
  const [pomocniServiseri, setPomocniServiseri] = useState<ServiserZaDodjelu[]>(
    [],
  );
  const [konfliktUpozorenje, setKonfliktUpozorenje] = useState<null | {
    zahtjev_id: number;
    pocetak: string;
    kraj: string;
  }>(null);

  const mozeMijenjatiPrioritet = dispecerSmijeMijenjatiOperativniPrioritet(
    zahtjev.status,
  );

  function setAktivniKorak(k: number) {
    setAktivniKorakRaw(k);
    setDostignutiKorak((prev) => Math.max(prev, k));
    setKorakGreska(null);
  }

  // Fetch scored recommendations when step 2 becomes active
  useEffect(() => {
    if (aktivniKorak !== 2) return;
    setUcitavaServ(true);
    fetch(`/api/dispecer/zahtjevi/${requestId}/preporuka`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        const lista: PreporukaServisera[] = Array.isArray(d.preporuke)
          ? d.preporuke
          : [];
        const odbijeni: string[] = Array.isArray(d.odbijeniServiserIds)
          ? d.odbijeniServiserIds
          : [];
        setPreporuke(lista);
        setOdbijeniServiserIds(odbijeni);
        // Auto-odaberi prvog neodbijena servisera
        if (!odabraniServ) {
          const prviNeodbijenPreporucen = lista.find(
            (p) => !odbijeni.includes(p.serviser.id),
          );
          if (prviNeodbijenPreporucen)
            setOdabraniServ(prviNeodbijenPreporucen.serviser);
        }
      })
      .catch(() => {
        setPreporuke([]);
        setOdbijeniServiserIds([]);
      })
      .finally(() => setUcitavaServ(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivniKorak, requestId]);

  // Fetch dispatcher name
  useEffect(() => {
    import('@/lib/supabase/klijent')
      .then(({ kreirajKlijenta }) => {
        const sb = kreirajKlijenta();
        return sb.auth.getUser();
      })
      .then(({ data }) => {
        if (data.user?.user_metadata) {
          const m = data.user.user_metadata as Record<string, string>;
          const ime =
            [m.ime, m.prezime].filter(Boolean).join(' ') ||
            m.full_name ||
            'Dispečer';
          setImeDispecera(ime);
        }
      })
      .catch(() => {});
  }, []);

  // Focus termin step from URL param
  const fokusRef = useRef(false);
  useEffect(() => {
    if (!fokusKorakTermin || fokusRef.current) return;
    fokusRef.current = true;
    setAktivniKorak(2);
  }, [fokusKorakTermin]);

  async function osvjeziZahtjev() {
    const r = await fetch(`/api/dispecer/zahtjevi/${requestId}`, {
      cache: 'no-store',
    });
    const d = await r.json();
    if (!r.ok) return;
    const novi = d.zahtjev as ZahtjevDetalj;
    onRequestUpdated?.(novi);
    onOsvjezajDetalj?.({ zahtjev: novi, aktivnosti: d.aktivnosti });
  }

  async function sacuvajPrioritet(): Promise<boolean> {
    if (!mozeMijenjatiPrioritet) return true;
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/dispecer/zahtjevi/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promijeni_prioritet',
          final_priority: prioritet,
          premium_downgrade_reason: downgradeRazlog,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri snimanju prioriteta.');
      await osvjeziZahtjev();
      return true;
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
      return false;
    } finally {
      setJeSlanje(false);
    }
  }

  async function sacuvajTerminIServiser(
    overrideKonflikt?: boolean,
  ): Promise<boolean> {
    if (!odabraniSlot || !odabraniServ) {
      setKorakGreska('Odaberite termin i servisera prije nastavka.');
      return false;
    }
    setJeSlanje(true);
    setGreska(null);
    setKonfliktUpozorenje(null);
    try {
      const pocetak = `${odabraniDatum}T${odabraniSlot.od}:00`;
      const kraj = `${odabraniDatum}T${odabraniSlot.do}:00`;
      const body: Record<string, unknown> = {
        action: 'dodijeli',
        serviser_id: odabraniServ.id,
        termin_planirani_pocetak: pocetak,
        termin_planirani_kraj: kraj,
        dispecer_napomene: napomene.trim() || undefined,
      };
      if (overrideKonflikt) {
        body.override_konflikt = true;
        body.razlog_konflikta = 'Dispečer svjesno prihvatio konflikt termina.';
      }
      const r = await fetch(`/api/dispecer/zahtjevi/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.status === 409 && d.kod === 'KONFLIKT_TERMINA') {
        setKonfliktUpozorenje(d.konflikt);
        setKorakGreska(
          `Serviser ima preklapanje termina sa intervencijom #${d.konflikt.zahtjev_id}. Potvrdite override ili odaberite drugog servisera.`,
        );
        return false;
      }
      if (!r.ok) throw new Error(d.error ?? 'Greška pri dodjeli servisera.');

      // Sačuvaj pomoćne servisere
      for (const pomocni of pomocniServiseri) {
        await fetch(`/api/dispecer/zahtjevi/${requestId}/tim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviser_id: pomocni.id }),
        });
      }

      setDodjelaUspjela(true);
      await osvjeziZahtjev();
      return true;
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
      return false;
    } finally {
      setJeSlanje(false);
    }
  }

  async function potvrdiNalog() {
    if (!potvrdjeno) return;
    setJeSlanje(true);
    setGreska(null);
    try {
      // `potvrdi` akcija radi samo za inbox statuse. Ako je zahtjev već prošao
      // inbox (dodjelaUspjela = true) ili ima potvrđeni/dodijeljeni status,
      // nalog je sačuvan - navigiraj na dispatcher pregled.
      const inboxStatusi = new Set([
        'na_cekanju',
        'pending_review',
        'in_review',
      ]);
      if (dodjelaUspjela || !inboxStatusi.has(zahtjev.status)) {
        router.push(hrefNazad ?? '/dispecer');
        return;
      }
      const r = await fetch(`/api/dispecer/zahtjevi/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'potvrdi', final_priority: prioritet }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri potvrdi naloga.');
      router.push(hrefNazad ?? '/dispecer');
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  async function nasledniKorak() {
    setKorakGreska(null);
    if (aktivniKorak === 1) {
      const ok = await sacuvajPrioritet();
      if (!ok) return;
    }
    if (aktivniKorak === 2) {
      const ok = await sacuvajTerminIServiser();
      if (!ok) return;
    }
    setAktivniKorak(Math.min(aktivniKorak + 1, 4));
  }

  const karticaStil = {
    backgroundColor: 'rgb(255 255 255/0.85)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.32)',
  };

  return (
    <div>
      {/* Banner: serviser odbio — dispečer treba odabrati novog servisera */}
      {zahtjev.serviser_odbio_razlog && (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl px-4 py-3.5"
          style={{
            backgroundColor: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.22)',
          }}
        >
          <AlertTriangle
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: '#DC2626' }}
          />
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
              Serviser je odbio ovu intervenciju
            </p>
            <p
              className="mt-0.5 text-xs leading-relaxed"
              style={{ color: 'var(--first-octonary)' }}
            >
              Razlog:{' '}
              <span className="font-semibold">
                {zahtjev.serviser_odbio_razlog}
              </span>{' '}
              — prioritet i termin su sačuvani. Odaberite novog servisera u
              koraku ispod.
            </p>
          </div>
        </div>
      )}

      <WizardStepper
        aktivni={aktivniKorak}
        dostupnoDoInkluzivno={dostignutiKorak}
        onKlik={setAktivniKorak}
      />

      {/* Two-column layout */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Main content card */}
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl p-5 sm:p-6" style={karticaStil}>
            {/* Step header */}
            <div className="mb-5 flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--first-primary)' }}
              >
                {aktivniKorak + 1}
              </span>
              <h2
                className="text-base font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {KORACI[aktivniKorak]?.naziv}
              </h2>
              {zahtjev.is_premium && aktivniKorak === 0 && (
                <div className="ml-1">
                  <PremiumHitnaBadge />
                </div>
              )}
            </div>

            {greska && (
              <div className="mb-4">
                <AlertMessage variant="error" message={greska} />
              </div>
            )}
            {korakGreska && (
              <div
                className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                <AlertTriangle
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: '#DC2626' }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: '#DC2626' }}
                >
                  {korakGreska}
                </p>
              </div>
            )}

            {aktivniKorak === 0 && <KorakPregled zahtjev={zahtjev} />}
            {aktivniKorak === 1 && (
              <KorakPrioritet
                zahtjev={zahtjev}
                prioritet={prioritet}
                setPrioritet={setPrioritet}
                downgradeRazlog={downgradeRazlog}
                setDowngradeRazlog={setDowngradeRazlog}
                mozeMijenjati={mozeMijenjatiPrioritet}
              />
            )}
            {aktivniKorak === 2 && (
              <KorakTerminIServiser
                zahtjev={zahtjev}
                odabraniDatum={odabraniDatum}
                setDatum={setOdabraniDatum}
                odabraniSlot={odabraniSlot}
                setSlot={setOdabraniSlot}
                napomene={napomene}
                setNapomene={setNapomene}
                preporuke={preporuke}
                odabraniServiser={odabraniServ}
                setServiser={setOdabraniServ}
                ucitavaServisere={ucitavaServ}
                pomocniServiseri={pomocniServiseri}
                setPomocniServiseri={setPomocniServiseri}
                konfliktUpozorenje={konfliktUpozorenje}
                onOverrideKonflikt={async () => {
                  const ok = await sacuvajTerminIServiser(true);
                  if (ok) setAktivniKorak(Math.min(aktivniKorak + 1, 4));
                }}
                odbijeniServiserIds={odbijeniServiserIds}
              />
            )}
            {aktivniKorak === 3 && (
              <KorakPregledNaloga
                zahtjev={zahtjev}
                prioritet={prioritet}
                odabraniServiser={odabraniServ}
                odabraniDatum={odabraniDatum}
                odabraniSlot={odabraniSlot}
                napomene={napomene}
                onUredi={setAktivniKorak}
              />
            )}
            {aktivniKorak === 4 && (
              <KorakPotvrda
                zahtjev={zahtjev}
                prioritet={prioritet}
                odabraniServiser={odabraniServ}
                odabraniDatum={odabraniDatum}
                odabraniSlot={odabraniSlot}
                potvrdjeno={potvrdjeno}
                setPotvrdjeno={setPotvrdjeno}
                imeDispecera={imeDispecera}
              />
            )}

            {/* Navigation */}
            <div
              className="mt-8 flex items-center justify-between gap-3 border-t pt-5"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.22)' }}
            >
              {aktivniKorak > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setAktivniKorakRaw((k) => k - 1)}
                  disabled={jeSlanje}
                >
                  Nazad
                </Button>
              ) : (
                <div />
              )}

              {aktivniKorak < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => void nasledniKorak()}
                  isLoading={jeSlanje}
                  loadingText="Spremanje..."
                >
                  Nastavi
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => void potvrdiNalog()}
                  disabled={!potvrdjeno}
                  isLoading={jeSlanje}
                  loadingText="Potvrđivanje..."
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Potvrdi nalog
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky summary panel */}
        <SummarniPanel
          zahtjev={zahtjev}
          prioritet={prioritet}
          odabraniServiser={odabraniServ}
          odabraniDatum={odabraniDatum}
          odabraniSlot={odabraniSlot}
        />
      </div>
    </div>
  );
}
