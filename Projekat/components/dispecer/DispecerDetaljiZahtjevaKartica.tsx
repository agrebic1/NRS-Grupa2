'use client';

import { MapPin, Phone, User } from 'lucide-react';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  formatPrijavljenoDatumVrijeme,
  hrefZaTelefon,
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  uRecenicu,
} from '@/lib/servisirane/zahtjevPrikaz';
import { urlsPrilozenihSlika } from '@/lib/servisirane/slikeZahtjeva';
import {
  DISPECER_HITNOST_KORISNIK_NASLOV,
  DISPECER_OPERATIVNI_NASLOV,
  DISPECER_OPERATIVNI_OPIS_NEDOSTAJE,
} from '@/lib/servisirane/dispecerPojmovi';
import { KorisnickaHitnostOutlinedChip } from '@/components/servisirane/zahtjevBadgeovi';
import { efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import {
  ZahtjevKorisnickaPorukaBubble,
  ZahtjevMiniTimeline,
} from '@/components/servisirane/ZahtjevTimelineIPoruka';
import { AdresaProsiriva } from '@/components/servisirane/AdresaProsiriva';
import { PrilogGalerija } from '@/components/servisirane/PrilogGalerija';
import { stilTekstaOperativnogPrioriteta } from '@/lib/servisirane/dispecerPaleta';

type ZahtjevZaKarticu = ServisniZahtjev & {
  podnosilac: { ime: string; prezime: string; broj_telefona: string | null } | null;
};

const POLJE_OZNAKA_KLASA =
  'mb-0.5 text-[11px] font-medium uppercase [letter-spacing:0.4px]';
const POLJE_OZNAKA_BOJA = { color: 'var(--first-nonary)' } as const;
const POLJE_IKONA_KLASA = 'mt-0.5 h-3.5 w-3.5 flex-shrink-0';
const GALERIJA_LABEL_KLASA =
  'mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]';
const SEKCIJA_GRUPE_LABEL_KLASA =
  'mb-3 text-[10px] font-semibold uppercase tracking-[0.12em]';
const SEKCIJA_GRUPE_BOJA = { color: 'rgb(var(--first-nonary-rgb) / 0.72)' } as const;
const SEKCIJA_GRUPE_RAZDJELNIK_BOJA = 'rgb(var(--first-quaternary-rgb) / 0.22)';

const UNUTARNJI_PANEL_KLASA = 'min-w-0 rounded-xl border p-4 sm:p-5';

/** Lijeva kartica „Detalji zahtjeva” na stranici detalja dispečera. */
export function DispecerDetaljiZahtjevaKartica({ zahtjev }: { zahtjev: ZahtjevZaKarticu }) {
  const podnosilac = zahtjev.podnosilac;

  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev, {
    dispecerskiPregled: true,
  });
  const slike = urlsPrilozenihSlika(zahtjev as ZahtjevZaKarticu & Record<string, unknown>);
  const opisSirovo = (zahtjev.description ?? '').trim();
  const opis = uRecenicu(opisSirovo);
  const telefonSirovo = podnosilac?.broj_telefona?.trim() || zahtjev.contact_phone?.trim() || '';
  const telefon = telefonSirovo || '-';
  const telefonHref = telefonSirovo ? hrefZaTelefon(telefonSirovo) : null;
  const imePrezime = imePrezimePodnosioca(podnosilac);
  const imaOperativni = Boolean(zahtjev.final_priority?.trim());
  const fp = zahtjev.final_priority?.trim() ?? '';
  const operativniStil = imaOperativni ? stilTekstaOperativnogPrioriteta(fp) : null;

  const naslovZahtjeva = podkategorija || glavna;
  const podnaslovKategorije = podkategorija ? glavna : null;
  const korisnickiUrgencyZaPrikaz = efektivniKorisnickiUrgencyScore(zahtjev);

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
        <section
          className={UNUTARNJI_PANEL_KLASA}
          style={{ borderColor: SEKCIJA_GRUPE_RAZDJELNIK_BOJA }}
          aria-label="Korisnik i lokacija"
        >
          <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
            Korisnik i lokacija
          </p>
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex gap-2">
              <User className={POLJE_IKONA_KLASA} style={POLJE_OZNAKA_BOJA} aria-hidden />
              <div className="min-w-0">
                <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                  Ime i prezime
                </p>
                <p className="text-base font-semibold leading-snug" style={{ color: 'var(--first-octonary)' }}>
                  {imePrezime}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Phone className={POLJE_IKONA_KLASA} style={POLJE_OZNAKA_BOJA} aria-hidden />
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
                  <p className="font-medium leading-snug" style={{ color: 'var(--first-octonary)' }}>
                    {telefon}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin className={POLJE_IKONA_KLASA} style={POLJE_OZNAKA_BOJA} aria-hidden />
              <div className="min-w-0 text-sm">
                <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                  Adresa
                </p>
                <p className="break-words font-medium leading-snug" style={{ color: 'var(--first-octonary)' }}>
                  {(zahtjev.address ?? '').trim() || '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={UNUTARNJI_PANEL_KLASA}
          style={{ borderColor: SEKCIJA_GRUPE_RAZDJELNIK_BOJA }}
          aria-label="Zahtjev"
        >
          <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
            Zahtjev
          </p>
          <h3
            className="text-base font-bold leading-snug sm:text-lg"
            style={{ color: 'var(--first-octonary)' }}
          >
            {naslovZahtjeva}
          </h3>
          {podnaslovKategorije && (
            <p className="mt-1.5 text-sm font-medium leading-snug" style={{ color: 'var(--first-nonary)' }}>
              {podnaslovKategorije}
            </p>
          )}
          <div className="mt-4 flex min-w-0 flex-col gap-4">
            <div className="min-w-0">
              <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                {DISPECER_HITNOST_KORISNIK_NASLOV}
              </p>
              <div className="mt-1.5">
                <KorisnickaHitnostOutlinedChip score={korisnickiUrgencyZaPrikaz} />
              </div>
            </div>
            <div className="min-w-0">
              <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                {DISPECER_OPERATIVNI_NASLOV}
              </p>
              {imaOperativni && operativniStil ? (
                <p className={`mt-1.5 ${operativniStil.className}`} style={operativniStil.style}>
                  {fp}
                </p>
              ) : (
                <p className="mt-1.5 text-sm leading-snug" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}>
                  {DISPECER_OPERATIVNI_OPIS_NEDOSTAJE}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section
        className="min-w-0 border-t pt-4"
        style={{ borderColor: SEKCIJA_GRUPE_RAZDJELNIK_BOJA }}
      >
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={SEKCIJA_GRUPE_BOJA}
        >
          Termin
        </p>
        <ZahtjevMiniTimeline
          prijavljenoTekst={formatPrijavljenoDatumVrijeme(zahtjev.created_at)}
          terminTekst={terminTekst}
          kompakt
        />
      </section>

      <section className="min-w-0">
        <p className={GALERIJA_LABEL_KLASA} style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}>
          Poruka korisnika
        </p>
        <ZahtjevKorisnickaPorukaBubble tekst={opis} className="mt-2 mb-0" />
      </section>

      <section id="dispecer-prilog-galerija" className="min-w-0 scroll-mt-28">
        <p className={GALERIJA_LABEL_KLASA} style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}>
          Priložene slike
        </p>
        {slike.length > 0 ? (
          <div className="mt-2">
            <PrilogGalerija urls={slike} className="max-w-2xl" />
          </div>
        ) : (
          <p className="mt-2 text-[11px] leading-snug" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.72)' }}>
            Nema priloženih slika
          </p>
        )}
      </section>
    </div>
  );
}
