'use client';

import type { ComponentType, CSSProperties } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Pencil,
  Ban,
  Lock,
  ChevronRight,
} from 'lucide-react';
import type {
  ServisniZahtjev,
  StatusZahtjeva,
} from '@/domain/types/servisirane';
import { brojZahtjevaZaPrikaz } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { korisnikSmijeMijenjatiIliOtkazatiZahtjev } from '@/lib/servisirane/statusZahtjeva';
import { inboxGrupaIzKorisnickeProcjene } from '@/lib/servisirane/urgency';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  preferiraniTerminZaDispecera,
  relativnoPrijavljenoZaDispecera,
} from '@/lib/servisirane/zahtjevPrikaz';
import {
  bojaRelativnogPrijaveDispecera,
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
} from '@/lib/servisirane/dispecerPaleta';
import { DispecerPremiumKruna } from '@/components/servisirane/zahtjevBadgeovi';
import { KorisnikPregledTokaBadzevi } from '@/components/korisnik/KorisnikPregledTokaBadzevi';

// ─── Životni ciklus statusa - Triple Coding ───────────────────────────────────

export const STATUS_LIFECYCLE: Record<
  StatusZahtjeva,
  {
    oznaka: string;
    boja: string;
    pozadina: string;
    border: string;
    Ikona: ComponentType<{ className?: string; style?: CSSProperties }>;
  }
> = {
  // Čekanje - amber (potrebna akcija dispečera)
  pending_review: {
    oznaka: 'Novi',
    boja: 'var(--first-senary)',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.1)',
    border: 'rgb(var(--first-senary-rgb) / 0.28)',
    Ikona: Clock,
  },
  na_cekanju: {
    oznaka: 'Novi',
    boja: 'var(--first-senary)',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.1)',
    border: 'rgb(var(--first-senary-rgb) / 0.28)',
    Ikona: Clock,
  },
  in_review: {
    oznaka: 'U obradi',
    boja: 'var(--first-senary)',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.1)',
    border: 'rgb(var(--first-senary-rgb) / 0.28)',
    Ikona: Clock,
  },
  // Potvrđeno/dodijeljeno - plava (na putu k rješavanju)
  potvrdeno: {
    oznaka: 'Potvrđeno',
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.08)',
    border: 'rgb(var(--first-secondary-rgb) / 0.22)',
    Ikona: CheckCircle2,
  },
  dodijeljeno: {
    oznaka: 'Servis dodijeljen',
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.08)',
    border: 'rgb(var(--first-secondary-rgb) / 0.22)',
    Ikona: CheckCircle2,
  },
  // Aktivna intervencija - plava (u tijeku)
  u_radu: {
    oznaka: 'Na putu',
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.08)',
    border: 'rgb(var(--first-secondary-rgb) / 0.22)',
    Ikona: Truck,
  },
  u_izvrsenju: {
    oznaka: 'Na terenu',
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.08)',
    border: 'rgb(var(--first-secondary-rgb) / 0.22)',
    Ikona: Truck,
  },
  // Završeno/arhivirano - neutralno (bez potrebne akcije)
  zavrseno: {
    oznaka: 'Završeno',
    boja: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quaternary-rgb) / 0.2)',
    border: 'rgb(var(--first-quaternary-rgb) / 0.4)',
    Ikona: CheckCircle2,
  },
  zatvoreno: {
    oznaka: 'Arhivirano',
    boja: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quaternary-rgb) / 0.2)',
    border: 'rgb(var(--first-quaternary-rgb) / 0.4)',
    Ikona: Lock,
  },
  otkazano: {
    oznaka: 'Otkazano',
    boja: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quinary-rgb) / 0.25)',
    border: 'rgb(var(--first-quaternary-rgb) / 0.4)',
    Ikona: Ban,
  },
  odbijeno: {
    oznaka: 'Odbijeno',
    boja: '#DC2626',
    pozadina: 'rgba(220,38,38,0.1)',
    border: 'rgba(220,38,38,0.25)',
    Ikona: XCircle,
  },
};

const FALLBACK_STATUS = {
  oznaka: 'Nepoznat status',
  boja: 'var(--first-nonary)',
  pozadina: 'rgb(var(--first-quinary-rgb) / 0.2)',
  border: 'rgb(var(--first-quaternary-rgb) / 0.35)',
  Ikona: Clock,
} as const;

// ─── Status badge (serviser / admin; korisnička lista koristi Dispecer paletu + tok) ─

export function StatusBadge({
  status,
  prikazZaKorisnika = false,
}: {
  status: StatusZahtjeva | string;
  prikazZaKorisnika?: boolean;
}) {
  const cfg =
    status in STATUS_LIFECYCLE
      ? STATUS_LIFECYCLE[status as StatusZahtjeva]
      : FALLBACK_STATUS;
  const Ikona = cfg.Ikona;
  const oznaka =
    prikazZaKorisnika && status === 'in_review'
      ? 'Dispečer obrađuje'
      : cfg.oznaka;
  return (
    <span
      className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:max-w-none"
      style={{
        backgroundColor: cfg.pozadina,
        color: cfg.boja,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Ikona className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{oznaka}</span>
    </span>
  );
}

// ─── Kartica zahtjeva - isti raspored kao DispecerskaZahtjevKartica (rub, chipovi, datum) ─

interface ZahtjevKarticaProps {
  zahtjev: ServisniZahtjev;
  onUredi?: (zahtjev: ServisniZahtjev) => void;
  onOtkazi?: (zahtjev: ServisniZahtjev) => void;
}

export function ZahtjevKartica({
  zahtjev,
  onUredi,
  onOtkazi,
}: ZahtjevKarticaProps) {
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev);
  const grupaInboxaPoKorisniku = inboxGrupaIzKorisnickeProcjene(zahtjev);
  const datumZaKarticu = terminTekst.includes(',')
    ? terminTekst.split(',')[0].trim()
    : terminTekst;
  const prijavljenoRel = relativnoPrijavljenoZaDispecera(zahtjev.created_at);
  const prijavljenoBoja = bojaRelativnogPrijaveDispecera(prijavljenoRel.ton);

  const mozeKorisnikUrediti = korisnikSmijeMijenjatiIliOtkazatiZahtjev(
    zahtjev.status,
    zahtjev.final_priority,
  );
  const jeOtkazano = zahtjev.status === 'otkazano';

  return (
    <article
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-md"
      style={{
        opacity: jeOtkazano ? 0.72 : 1,
        backgroundColor: 'rgb(255 255 255 / 0.72)',
        borderStyle: 'solid',
        borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
        borderWidth: 1,
        borderLeftWidth: 4,
        borderLeftColor: zahtjev.is_premium
          ? DISPECER_PALETA_PREMIUM.akcent
          : DISPECER_PALETA_HITNOST[grupaInboxaPoKorisniku].border,
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="inline-flex max-w-full shrink-0 items-center gap-1.5">
              <span
                className="inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
                style={{
                  backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.2)',
                  color: 'var(--first-octonary)',
                  border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
                }}
              >
                #{brojZahtjevaZaPrikaz(zahtjev)}
              </span>
              {zahtjev.is_premium ? (
                <DispecerPremiumKruna className="translate-y-px" />
              ) : null}
            </span>
            <div className="min-w-0 max-w-full">
              <KorisnikPregledTokaBadzevi zahtjev={zahtjev} />
            </div>
          </div>
        </div>

        <div className="mt-3 min-w-0 space-y-1">
          <p
            className="break-words text-sm font-semibold leading-snug"
            style={{ color: 'var(--first-octonary)' }}
            title={glavna}
          >
            {glavna}
          </p>
          {podkategorija ? (
            <p
              className="break-words text-sm font-bold leading-snug"
              style={{ color: 'var(--first-octonary)' }}
              title={podkategorija}
            >
              {podkategorija}
            </p>
          ) : null}
          <p
            className="break-words text-sm font-medium leading-snug"
            style={{ color: 'var(--first-nonary)' }}
          >
            {(zahtjev.address ?? '').trim() || '-'}
          </p>
        </div>

        <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
          <p
            suppressHydrationWarning
            className="min-w-0 truncate text-xs font-medium leading-snug tabular-nums"
            title={`${datumZaKarticu} · ${prijavljenoRel.label} (${terminTekst})`}
          >
            <span style={{ color: 'var(--first-nonary)' }}>
              {datumZaKarticu}
            </span>
            <span style={{ color: 'rgb(var(--first-nonary-rgb) / 0.45)' }}>
              {' '}
              ·{' '}
            </span>
            <span
              className={
                prijavljenoRel.ton === 'stale' ? 'font-bold' : 'font-semibold'
              }
              style={{ color: prijavljenoBoja }}
            >
              {prijavljenoRel.label}
            </span>
          </p>
        </div>
      </div>

      <div
        className="flex min-w-0 flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.22)' }}
      >
        <Link
          href={`/korisnik/zahtjevi/${zahtjev.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-deep-teal px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-celestial-teal focus:outline-none focus:ring-2 focus:ring-celestial-teal/40 focus:ring-offset-2 sm:w-auto sm:min-w-[8.5rem]"
        >
          Detalji
          <ChevronRight className="h-4 w-4" />
        </Link>
        {mozeKorisnikUrediti && (onUredi || onOtkazi) && (
          <div className="flex justify-end gap-1 sm:justify-end">
            {onUredi && (
              <button
                type="button"
                onClick={() => onUredi(zahtjev)}
                title="Izmijeni zahtjev"
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150 hover:scale-[1.02]"
                style={{
                  borderColor: 'rgb(var(--first-primary-rgb) / 0.25)',
                  backgroundColor: 'rgb(var(--first-primary-rgb) / 0.06)',
                  color: 'var(--first-primary)',
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onOtkazi && (
              <button
                type="button"
                onClick={() => onOtkazi(zahtjev)}
                title="Otkaži zahtjev"
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150 hover:scale-[1.02]"
                style={{
                  borderColor: 'rgba(220,38,38,0.25)',
                  backgroundColor: 'rgba(220,38,38,0.06)',
                  color: '#DC2626',
                }}
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
