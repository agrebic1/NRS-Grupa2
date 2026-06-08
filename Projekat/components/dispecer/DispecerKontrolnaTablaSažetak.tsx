'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ZahtjevZaDispecerskuKarticu } from '@/components/dispecer/DispecerskaZahtjevKartica';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  hrefZaTelefon,
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  uRecenicu,
} from '@/lib/servisirane/zahtjevPrikaz';
import { DispecerPregledTokaBadzevi } from '@/components/dispecer/DispecerPregledTokaBadzevi';
import {
  DispecerPremiumKruna,
  KorisnickaHitnostOutlinedChip,
} from '@/components/servisirane/zahtjevBadgeovi';
import { efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import { ZahtjevKorisnickaPorukaBubble } from '@/components/servisirane/ZahtjevTimelineIPoruka';
import { oznakaZaDispecerskiPrikazBroja } from '@/lib/servisirane/korisnickiBrojZahtjeva';

const POLJE_OZNAKA_KLASA =
  'mb-0.5 text-[11px] font-medium uppercase [letter-spacing:0.4px]';
const POLJE_OZNAKA_BOJA = { color: 'var(--first-nonary)' } as const;

/** Sažetak za desni panel na kontrolnoj tabli (bez obrade / potvrde). */
export function DispecerKontrolnaTablaSažetak({
  zahtjev,
}: {
  zahtjev: ZahtjevZaDispecerskuKarticu;
}) {
  const podnosilac = zahtjev.podnosilac;
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const naslovKratki = podkategorija || glavna;
  const podnaslovKategorije = podkategorija ? glavna : null;

  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev, {
    dispecerskiPregled: true,
  });
  const terminPrikaz = terminTekst.includes(',')
    ? terminTekst.replace(',', ' ·')
    : terminTekst;

  const telefonSirovo =
    podnosilac?.broj_telefona?.trim() || zahtjev.contact_phone?.trim() || '';
  const telefon = telefonSirovo || '-';
  const telefonHref = telefonSirovo ? hrefZaTelefon(telefonSirovo) : null;
  const imePrezime = imePrezimePodnosioca(podnosilac);
  const opisSirovo = (zahtjev.description ?? '').trim();
  const opis = uRecenicu(opisSirovo);
  const opisUNavodnicima = opis ? `„${opis}“` : '';

  const korisnickiUrgencyZaPrikaz = efektivniKorisnickiUrgencyScore(zahtjev);

  return (
    <div
      className="flex min-w-0 flex-col rounded-2xl bg-white p-5 shadow-card sm:p-6"
      style={{ border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)' }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold leading-snug sm:text-xl"
            style={{ color: 'var(--first-octonary)' }}
          >
            <span className="inline-flex items-center gap-2">
              #{oznakaZaDispecerskiPrikazBroja(zahtjev)}
              {zahtjev.is_premium ? <DispecerPremiumKruna /> : null}
            </span>
            <span className="min-w-0">{naslovKratki}</span>
          </h2>
          {podnaslovKategorije ? (
            <p
              className="mt-1.5 text-sm font-medium leading-snug"
              style={{ color: 'var(--first-nonary)' }}
            >
              {podnaslovKategorije}
            </p>
          ) : null}
        </div>
        <Link
          href={`/dispecer/zahtjevi/${zahtjev.id}`}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-bold transition-opacity hover:opacity-75"
          style={{ color: 'var(--first-secondary)' }}
        >
          Detalji
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
        <DispecerPregledTokaBadzevi zahtjev={zahtjev} />
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--first-nonary)' }}
        >
          Procjena hitnosti:
        </span>
        <KorisnickaHitnostOutlinedChip score={korisnickiUrgencyZaPrikaz} />
      </div>

      <div
        className="mt-5 border-t pt-5"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.22)' }}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
              Korisnik
            </p>
            <p
              className="text-base font-semibold leading-snug"
              style={{ color: 'var(--first-octonary)' }}
            >
              {imePrezime}
            </p>
          </div>
          <div className="min-w-0">
            <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
              Kontakt
            </p>
            {telefonHref ? (
              <a
                href={telefonHref}
                className="text-base font-semibold leading-snug underline-offset-2 hover:underline"
                style={{ color: 'var(--first-octonary)' }}
              >
                {telefon}
              </a>
            ) : (
              <p
                className="text-base font-semibold leading-snug"
                style={{ color: 'var(--first-octonary)' }}
              >
                {telefon}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 min-w-0">
          <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
            Adresa
          </p>
          <p
            className="break-words text-sm font-medium leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {(zahtjev.address ?? '').trim() || '-'}
          </p>
        </div>

        <div className="mt-5 min-w-0">
          <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
            Preferirani termin
          </p>
          <p
            className="text-sm font-semibold tabular-nums leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {terminPrikaz}
          </p>
        </div>
      </div>

      {opisUNavodnicima ? (
        <ZahtjevKorisnickaPorukaBubble
          tekst={opisUNavodnicima}
          className="mt-5 mb-0"
        />
      ) : null}
    </div>
  );
}
