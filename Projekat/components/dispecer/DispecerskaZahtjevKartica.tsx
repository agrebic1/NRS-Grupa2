'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';
import {
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  relativnoPrijavljenoZaDispecera,
} from '@/lib/servisirane/zahtjevPrikaz';
import {
  bojaRelativnogPrijaveDispecera,
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
} from '@/lib/servisirane/dispecerPaleta';
import { DISPECER_HITNOST_KORISNIK_CHIP_TITLE } from '@/lib/servisirane/dispecerPojmovi';
import { ZahtjevExpandSadrzaj } from '@/components/dispecer/ZahtjevExpandSadrzaj';
import { DispecerPregledTokaBadzevi } from '@/components/dispecer/DispecerPregledTokaBadzevi';
import {
  DispecerPremiumKruna,
  KorisnickaHitnostOutlinedChip,
} from '@/components/servisirane/zahtjevBadgeovi';
import { PonovniCiklusBadge } from '@/components/servisirane/PonovniCiklusBadge';
import { DugoChekanjeBadge } from '@/components/servisirane/DugoChekanjeBadge';
import {
  efektivniKorisnickiUrgencyScore,
  inboxGrupaIzKorisnickeProcjene,
} from '@/lib/servisirane/urgency';
import { oznakaZaDispecerskiPrikazBroja } from '@/lib/servisirane/korisnickiBrojZahtjeva';

/** @deprecated Koristite `zahtjevCekaObraduUInboxuDispecera` iz `@/lib/servisirane/statusZahtjeva`. */
export const zahtjevCekaObraduSprint7 = zahtjevCekaObraduUInboxuDispecera;

export { DispecerStatusBadge } from '@/components/servisirane/zahtjevBadgeovi';

export type ZahtjevZaDispecerskuKarticu = ServisniZahtjev & {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
  intervencija_ocjene?: { ocjena: number; komentar: string | null }[] | null;
};

export interface DispecerskaZahtjevKarticaProps {
  zahtjev: ZahtjevZaDispecerskuKarticu;
  expanded?: boolean;
  onExpandToggle?: () => void;
  selected?: boolean;
}

export function DispecerskaZahtjevKartica({
  zahtjev,
  expanded: expandedProp,
  onExpandToggle,
  selected = false,
}: DispecerskaZahtjevKarticaProps) {
  const podnosilac = zahtjev.podnosilac;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);

  const kontrolirano = expandedProp !== undefined;
  const expanded = kontrolirano ? expandedProp : uncontrolledExpanded;

  function toggleExpanded() {
    if (onExpandToggle) onExpandToggle();
    else setUncontrolledExpanded((v) => !v);
  }

  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev, {
    dispecerskiPregled: true,
  });
  const imePrezime = imePrezimePodnosioca(podnosilac);
  const datumZaKarticu = terminTekst.includes(',')
    ? terminTekst.split(',')[0].trim()
    : terminTekst;
  const prijavljenoRel = relativnoPrijavljenoZaDispecera(zahtjev.created_at);
  const prijavljenoBoja = bojaRelativnogPrijaveDispecera(prijavljenoRel.ton);
  const scoreZaPrikaz = efektivniKorisnickiUrgencyScore(zahtjev);
  const grupaInboxaPoKorisniku = inboxGrupaIzKorisnickeProcjene(zahtjev);

  return (
    <article
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-md"
      style={{
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
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex w-full min-w-0 shrink-0 flex-col gap-0 px-3 py-3 text-left transition-colors hover:bg-black/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--first-secondary-rgb)/0.45)] focus-visible:ring-offset-2 sm:px-4"
        style={{
          backgroundColor: selected
            ? 'rgb(var(--first-secondary-rgb) / 0.08)'
            : '#ffffff',
        }}
        aria-expanded={expanded}
      >
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
                #{oznakaZaDispecerskiPrikazBroja(zahtjev)}
              </span>
              {zahtjev.is_premium ? (
                <DispecerPremiumKruna className="translate-y-px" />
              ) : null}
              {(zahtjev.broj_ponovnih_ciklusa ?? 0) > 0 && (
                <PonovniCiklusBadge broj={zahtjev.broj_ponovnih_ciklusa!} />
              )}
              <DugoChekanjeBadge
                status={zahtjev.status}
                createdAt={zahtjev.created_at}
                kompaktan
              />
            </span>
            <div className="min-w-0 max-w-full">
              <DispecerPregledTokaBadzevi zahtjev={zahtjev} />
            </div>
          </div>
          <div
            className="shrink-0 pt-0.5"
            title={DISPECER_HITNOST_KORISNIK_CHIP_TITLE}
          >
            <KorisnickaHitnostOutlinedChip score={scoreZaPrikaz} />
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
            className="min-w-0 truncate text-sm font-medium leading-snug"
            style={{ color: 'var(--first-nonary)' }}
            title={imePrezime}
          >
            {imePrezime}
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
          <ChevronRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out"
            style={{
              color: 'var(--first-nonary)',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
            aria-hidden
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden border-t border-soft-beige">
          <div className="px-3.5 pb-3.5 pt-5 sm:px-4 sm:pb-4">
            <ZahtjevExpandSadrzaj
              zahtjev={zahtjev}
              detaljiHref={`/dispecer/zahtjevi/${zahtjev.id}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
