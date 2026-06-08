'use client';

import { useId } from 'react';
import Link from 'next/link';
import { MapPin, Phone, User } from 'lucide-react';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  formatPrijavljenoDatumVrijeme,
  hrefZaTelefon,
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  skracenTekst,
  uRecenicu,
} from '@/lib/servisirane/zahtjevPrikaz';
import { urlsPrilozenihSlika } from '@/lib/servisirane/slikeZahtjeva';
import {
  DISPECER_HITNOST_KORISNIK_NASLOV,
  DISPECER_OPERATIVNI_NASLOV,
  DISPECER_OPERATIVNI_OPIS_NEDOSTAJE,
} from '@/lib/servisirane/dispecerPojmovi';
import {
  ExpandPanelPreciznaLokacijaChip,
  ExpandPanelTerminNavedenChip,
  KorisnickaHitnostOutlinedChip,
  PremiumHitnaBadge,
} from '@/components/servisirane/zahtjevBadgeovi';
import { efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import {
  ZahtjevKorisnickaPorukaBubble,
  ZahtjevMiniTimeline,
} from '@/components/servisirane/ZahtjevTimelineIPoruka';
import { PrilogGalerija } from '@/components/servisirane/PrilogGalerija';
import { stilTekstaOperativnogPrioriteta } from '@/lib/servisirane/dispecerPaleta';

export type ZahtjevZaExpand = ServisniZahtjev & {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
};

/** Oznake polja (Korisnik, Kontakt, …) - tipografija + 2px do vrijednosti */
const POLJE_OZNAKA_KLASA =
  'mb-0.5 text-[11px] font-medium uppercase [letter-spacing:0.4px]';
const POLJE_OZNAKA_BOJA = { color: 'var(--first-nonary)' } as const;
const POLJE_IKONA_KLASA = 'mt-0.5 h-3.5 w-3.5 flex-shrink-0';

interface ZahtjevExpandSadrzajProps {
  zahtjev: ZahtjevZaExpand;
  detaljiHref?: string;
  skratiOpis?: boolean;
  prikaziNaslovKategorije?: boolean;
  prikaziThumbnailPriloge?: boolean;
  className?: string;
}

const GALERIJA_LABEL_KLASA =
  'mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]';

/** Grupna oznaka iznad blokova na stranici detalja zahtjeva (samo prikaziThumbnailPriloge). */
const SEKCIJA_GRUPE_LABEL_KLASA =
  'mb-3 text-[10px] font-semibold uppercase tracking-[0.12em]';
const SEKCIJA_GRUPE_BOJA = {
  color: 'rgb(var(--first-nonary-rgb) / 0.72)',
} as const;
const SEKCIJA_GRUPE_RAZDJELNIK_BOJA = 'rgb(var(--first-quaternary-rgb) / 0.22)';

export function ZahtjevExpandSadrzaj({
  zahtjev,
  detaljiHref,
  skratiOpis = true,
  prikaziNaslovKategorije = true,
  prikaziThumbnailPriloge = false,
  className = '',
}: ZahtjevExpandSadrzajProps) {
  const podnosilac = zahtjev.podnosilac;
  const hitnostGrupaId = useId();

  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const { tekstCijeli: terminTekst, imaPreferirani } =
    preferiraniTerminZaDispecera(zahtjev, {
      dispecerskiPregled: true,
    });
  const imaKoordinate = zahtjev.latitude != null && zahtjev.longitude != null;
  const slike = urlsPrilozenihSlika(
    zahtjev as ZahtjevZaExpand & Record<string, unknown>,
  );
  const opisSirovo = (zahtjev.description ?? '').trim();
  const opis = uRecenicu(skratiOpis ? skracenTekst(opisSirovo) : opisSirovo);
  const telefonSirovo =
    podnosilac?.broj_telefona?.trim() || zahtjev.contact_phone?.trim() || '';
  const telefon = telefonSirovo || '-';
  const telefonHref = telefonSirovo ? hrefZaTelefon(telefonSirovo) : null;
  const imePrezime = imePrezimePodnosioca(podnosilac);
  const imaOperativni = Boolean(zahtjev.final_priority?.trim());
  const fp = zahtjev.final_priority?.trim() ?? '';
  const operativniStil = imaOperativni
    ? stilTekstaOperativnogPrioriteta(fp)
    : null;
  const korisnickiUrgencyZaPrikaz = efektivniKorisnickiUrgencyScore(zahtjev);

  return (
    <div
      className={['min-w-0 max-w-full', className].filter(Boolean).join(' ')}
    >
      {!prikaziThumbnailPriloge &&
        (zahtjev.is_premium || prikaziNaslovKategorije) && (
          <div className="mb-4 min-w-0">
            {prikaziNaslovKategorije && (
              <h3
                className="text-base font-bold leading-snug sm:text-lg"
                style={{ color: 'var(--first-octonary)' }}
              >
                {glavna}
              </h3>
            )}
            {zahtjev.is_premium && (
              <div className={prikaziNaslovKategorije ? 'mt-2' : ''}>
                <PremiumHitnaBadge />
              </div>
            )}
          </div>
        )}

      {prikaziThumbnailPriloge ? (
        <>
          <div className="flex min-w-0 flex-col lg:flex-row lg:items-stretch">
            <section className="min-w-0 flex-1 basis-0 lg:min-w-0">
              <p
                className={SEKCIJA_GRUPE_LABEL_KLASA}
                style={SEKCIJA_GRUPE_BOJA}
              >
                Podaci o korisniku
              </p>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex gap-2">
                  <User
                    className={POLJE_IKONA_KLASA}
                    style={POLJE_OZNAKA_BOJA}
                    aria-hidden
                  />
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
                </div>
                <div className="flex gap-2">
                  <Phone
                    className={POLJE_IKONA_KLASA}
                    style={POLJE_OZNAKA_BOJA}
                    aria-hidden
                  />
                  <div className="min-w-0 text-sm">
                    <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                      Kontakt
                    </p>
                    {telefonHref ? (
                      <a
                        href={telefonHref}
                        className="font-medium leading-snug underline-offset-2 hover:underline"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        {telefon}
                      </a>
                    ) : (
                      <p
                        className="font-medium leading-snug"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        {telefon}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <MapPin
                    className={POLJE_IKONA_KLASA}
                    style={POLJE_OZNAKA_BOJA}
                    aria-hidden
                  />
                  <div className="min-w-0 text-sm">
                    <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                      Adresa
                    </p>
                    <p
                      className="break-words font-medium leading-snug"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      {(zahtjev.address ?? '').trim() || '-'}
                    </p>
                    {imaKoordinate && (
                      <div className="mt-1">
                        <ExpandPanelPreciznaLokacijaChip />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section
              className="mt-8 min-w-0 flex-1 basis-0 border-t pt-8 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 lg:min-w-0"
              style={{ borderColor: SEKCIJA_GRUPE_RAZDJELNIK_BOJA }}
            >
              <p
                className={SEKCIJA_GRUPE_LABEL_KLASA}
                style={SEKCIJA_GRUPE_BOJA}
              >
                Podaci o zahtjevu
              </p>
              <h3
                className="text-base font-bold leading-snug sm:text-lg"
                style={{ color: 'var(--first-octonary)' }}
              >
                {glavna}
              </h3>
              {podkategorija && (
                <p
                  className="mt-2 text-sm leading-snug"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  <span
                    className="font-medium"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Podkategorija:{' '}
                  </span>
                  {podkategorija}
                </p>
              )}
              {zahtjev.is_premium && (
                <div className="mt-2">
                  <PremiumHitnaBadge />
                </div>
              )}
              <div
                className="mt-3 flex min-w-0 flex-col gap-3"
                role="group"
                aria-labelledby={hitnostGrupaId}
              >
                <div className="min-w-0">
                  <p
                    id={hitnostGrupaId}
                    className={POLJE_OZNAKA_KLASA}
                    style={POLJE_OZNAKA_BOJA}
                  >
                    {DISPECER_HITNOST_KORISNIK_NASLOV}
                  </p>
                  <div className="mt-1.5">
                    <KorisnickaHitnostOutlinedChip
                      score={korisnickiUrgencyZaPrikaz}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                    {DISPECER_OPERATIVNI_NASLOV}
                  </p>
                  {imaOperativni && operativniStil ? (
                    <p
                      className={`mt-1.5 ${operativniStil.className}`}
                      style={operativniStil.style}
                    >
                      {fp}
                    </p>
                  ) : (
                    <p
                      className="mt-1.5 text-sm leading-snug"
                      style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}
                    >
                      {DISPECER_OPERATIVNI_OPIS_NEDOSTAJE}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <section
            className="mt-8 border-t pt-8 min-w-0"
            style={{ borderColor: SEKCIJA_GRUPE_RAZDJELNIK_BOJA }}
          >
            <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
              Termin i dokumentacija
            </p>
            <ZahtjevMiniTimeline
              prijavljenoTekst={formatPrijavljenoDatumVrijeme(
                zahtjev.created_at,
              )}
              terminTekst={terminTekst}
            />
            <ZahtjevKorisnickaPorukaBubble tekst={opis} className="mt-4 mb-4" />
            <div className="mb-3 min-w-0">
              <p
                className={GALERIJA_LABEL_KLASA}
                style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}
              >
                Priložene slike
              </p>
              {slike.length > 0 ? (
                <PrilogGalerija urls={slike} className="max-w-2xl" />
              ) : (
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: 'rgb(var(--first-nonary-rgb) / 0.72)' }}
                >
                  Nema priloženih slika
                </p>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="mb-4 grid grid-cols-1 items-start gap-x-5 sm:grid-cols-2">
          <div className="min-w-0 flex flex-col gap-3">
            <div className="flex gap-2">
              <User
                className={POLJE_IKONA_KLASA}
                style={POLJE_OZNAKA_BOJA}
                aria-hidden
              />
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
            </div>
            <div className="flex gap-2">
              <Phone
                className={POLJE_IKONA_KLASA}
                style={POLJE_OZNAKA_BOJA}
                aria-hidden
              />
              <div className="min-w-0 text-sm">
                <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                  Kontakt
                </p>
                {telefonHref ? (
                  <a
                    href={telefonHref}
                    className="font-medium leading-snug underline-offset-2 hover:underline"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {telefon}
                  </a>
                ) : (
                  <p
                    className="font-medium leading-snug"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {telefon}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin
                className={POLJE_IKONA_KLASA}
                style={POLJE_OZNAKA_BOJA}
                aria-hidden
              />
              <div className="min-w-0 text-sm">
                <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                  Adresa
                </p>
                <p
                  className="break-words font-medium leading-snug"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {(zahtjev.address ?? '').trim() || '-'}
                </p>
                {imaKoordinate && (
                  <div className="mt-1">
                    <ExpandPanelPreciznaLokacijaChip />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="flex min-w-0 flex-col gap-3"
            role="group"
            aria-labelledby={hitnostGrupaId}
          >
            <div className="min-w-0">
              <p
                id={hitnostGrupaId}
                className={POLJE_OZNAKA_KLASA}
                style={POLJE_OZNAKA_BOJA}
              >
                {DISPECER_HITNOST_KORISNIK_NASLOV}
              </p>
              <div className="mt-1.5">
                <KorisnickaHitnostOutlinedChip
                  score={korisnickiUrgencyZaPrikaz}
                />
              </div>
              {podkategorija && (
                <p
                  className="mt-2 text-sm leading-snug"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  <span
                    className="font-medium"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Podkategorija:{' '}
                  </span>
                  {podkategorija}
                </p>
              )}
            </div>
            <div className="min-w-0">
              <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                {DISPECER_OPERATIVNI_NASLOV}
              </p>
              {imaOperativni && operativniStil ? (
                <p
                  className={`mt-1.5 ${operativniStil.className}`}
                  style={operativniStil.style}
                >
                  {fp}
                </p>
              ) : (
                <p
                  className="mt-1.5 text-sm leading-snug"
                  style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}
                >
                  {DISPECER_OPERATIVNI_OPIS_NEDOSTAJE}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!prikaziThumbnailPriloge && (
        <>
          <ZahtjevMiniTimeline
            prijavljenoTekst={formatPrijavljenoDatumVrijeme(zahtjev.created_at)}
            terminTekst={terminTekst}
          />

          <ZahtjevKorisnickaPorukaBubble tekst={opis} className="mt-4 mb-4" />

          <div className="mb-3 min-w-0">
            <p
              className={GALERIJA_LABEL_KLASA}
              style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}
            >
              Priložene slike
            </p>
            {slike.length > 0 ? (
              <PrilogGalerija urls={slike} className="max-w-2xl" />
            ) : (
              <p
                className="text-[11px] leading-snug"
                style={{ color: 'rgb(var(--first-nonary-rgb) / 0.72)' }}
              >
                Nema priloženih slika
              </p>
            )}
          </div>
        </>
      )}

      <footer
        className="mt-auto border-t pt-2"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}
      >
        {(imaPreferirani || imaKoordinate) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {imaPreferirani && <ExpandPanelTerminNavedenChip />}
            {imaKoordinate && <ExpandPanelPreciznaLokacijaChip />}
          </div>
        )}
        {detaljiHref && (
          <div className="flex w-full justify-end">
            <Link
              href={detaljiHref}
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-soft-beige bg-transparent px-5 py-2.5 text-sm font-semibold text-deep-teal transition-colors hover:border-celestial-teal hover:bg-celestial-teal/5 focus:outline-none focus:ring-2 focus:ring-celestial-teal/40 focus:ring-offset-2 sm:w-auto sm:min-w-[8.5rem]"
            >
              Detalji <span aria-hidden>&gt;</span>
            </Link>
          </div>
        )}
      </footer>
    </div>
  );
}
