'use client';

import type { CSSProperties, ReactNode } from 'react';
import { MapPin, Phone } from 'lucide-react';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { brojZahtjevaZaPrikaz } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  formatPrijavljenoDatumVrijeme,
  hrefZaTelefon,
  preferiraniTerminZaDispecera,
  uRecenicu,
} from '@/lib/servisirane/zahtjevPrikaz';
import { urlsPrilozenihSlika } from '@/lib/servisirane/slikeZahtjeva';
import { efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import {
  korisnickiTokBedzStil,
  korisnickiTokBedzTekst,
} from '@/lib/servisirane/korisnickiTokPrikaz';
import {
  korisnikHeroTekst,
  korisnikStatusDetaljTekst,
} from '@/lib/servisirane/korisnickiDetaljTekstovi';
import {
  DispecerPremiumKruna,
  KorisnickaHitnostOutlinedChip,
  PreciznaLokacijaChip,
} from '@/components/servisirane/zahtjevBadgeovi';
import { PrilogGalerija } from '@/components/servisirane/PrilogGalerija';
import {
  ZahtjevKorisnickaPorukaBubble,
  ZahtjevMiniTimeline,
} from '@/components/servisirane/ZahtjevTimelineIPoruka';

// Re-export helper-a - ostaje stabilan import za potrošače.
export {
  korisnikDonjiStatusObjasnjenje,
  korisnikHeroTekst,
  korisnikStatusDetaljTekst,
} from '@/lib/servisirane/korisnickiDetaljTekstovi';

// ─── Stilske konstante (usklađene s `DispecerDetaljiZahtjevaKartica`) ─────────

const POLJE_OZNAKA_KLASA =
  'mb-0.5 text-[11px] font-medium uppercase [letter-spacing:0.4px]';
const POLJE_OZNAKA_BOJA = { color: 'var(--first-nonary)' } as const;
const POLJE_IKONA_KLASA = 'mt-0.5 h-3.5 w-3.5 flex-shrink-0';

const SEKCIJA_GRUPE_LABEL_KLASA =
  'mb-3 text-[10px] font-semibold uppercase tracking-[0.12em]';
const SEKCIJA_GRUPE_BOJA = {
  color: 'rgb(var(--first-nonary-rgb) / 0.72)',
} as const;
const SEKCIJA_RAZDJELNIK_BOJA = 'rgb(var(--first-quaternary-rgb) / 0.22)';

const UNUTARNJI_PANEL_KLASA = 'min-w-0 rounded-xl border p-4 sm:p-5';

const POPRATNA_LABEL_KLASA =
  'mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]';
const POPRATNA_LABEL_BOJA = {
  color: 'rgb(var(--first-nonary-rgb) / 0.78)',
} as const;

// ─── Inline notice (jedan border-only kalup za sve dno-poruke) ────────────────

type InlineNoticeTon = 'neutral' | 'danger' | 'info';

const INLINE_NOTICE_STIL: Record<InlineNoticeTon, CSSProperties> = {
  neutral: {
    borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
    color: 'var(--first-octonary)',
  },
  danger: {
    borderColor: 'rgba(220,38,38,0.3)',
    color: 'var(--first-octonary)',
  },
  info: {
    borderColor: 'rgb(var(--first-secondary-rgb) / 0.28)',
    color: 'rgb(var(--first-nonary-rgb) / 0.95)',
  },
};

export function InlineNotice({
  children,
  ton = 'neutral',
}: {
  children: ReactNode;
  ton?: InlineNoticeTon;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm leading-relaxed"
      style={INLINE_NOTICE_STIL[ton]}
    >
      {children}
    </div>
  );
}

/** Donja napomena (ostavljena radi backward kompatibilnosti - sada je samo `InlineNotice` info ton). */
export function KorisnikZahtjevDonjaNapomena({
  children,
}: {
  children: ReactNode;
}) {
  return <InlineNotice ton="info">{children}</InlineNotice>;
}

// ─── Glavni panel ─────────────────────────────────────────────────────────────

interface KorisnikZahtjevDetaljPanelProps {
  zahtjev: ServisniZahtjev;
  mozeBitMijenjan: boolean;
  uAktivnojDispecerskojObradi: boolean;
  porukaProširena: boolean;
  porukaTrebaSkracivanje: boolean;
  onTogglePoruku: () => void;
}

export function KorisnikZahtjevDetaljPanel({
  zahtjev,
  mozeBitMijenjan,
  uAktivnojDispecerskojObradi,
  porukaProširena,
  porukaTrebaSkracivanje,
  onTogglePoruku,
}: KorisnikZahtjevDetaljPanelProps) {
  const kategorija = labelKategorije(zahtjev);
  const naslovZahtjeva = kategorija.podkategorija || kategorija.glavna;
  const podnaslovKategorije = kategorija.podkategorija
    ? kategorija.glavna
    : null;

  const { tekstCijeli: terminTekst } = preferiraniTerminZaDispecera(zahtjev);

  const opisSirovo = (zahtjev.description ?? '').trim();
  const opis = uRecenicu(opisSirovo);
  const opisZaPrikaz =
    porukaTrebaSkracivanje && !porukaProširena
      ? `${opis.slice(0, 180).trim()}…`
      : opis;

  const telefonSirovo = zahtjev.contact_phone?.trim() || '';
  const telefon = telefonSirovo || '-';
  const telefonHref = telefonSirovo ? hrefZaTelefon(telefonSirovo) : null;

  const slike = urlsPrilozenihSlika(
    zahtjev as unknown as Parameters<typeof urlsPrilozenihSlika>[0],
  );

  const score = efektivniKorisnickiUrgencyScore(zahtjev);
  const hero = korisnikHeroTekst(
    zahtjev,
    mozeBitMijenjan,
    uAktivnojDispecerskojObradi,
  );
  const statusTekst = korisnikStatusDetaljTekst(zahtjev);
  const operativniTekst =
    (zahtjev.final_priority ?? '').trim() || 'Nije dodijeljen';
  const imaPreciznuLokaciju =
    zahtjev.latitude !== null && zahtjev.longitude !== null;

  return (
    <div className="min-w-0 space-y-5">
      {/* Zaglavlje kartice - id, premium, naslov, kategorija */}
      <header className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span
            className="inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[12px] font-bold tabular-nums"
            style={{
              backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.2)',
              color: 'var(--first-octonary)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            #{brojZahtjevaZaPrikaz(zahtjev)}
          </span>
          {zahtjev.is_premium ? (
            <DispecerPremiumKruna className="h-4 w-4 translate-y-px" />
          ) : null}
          <h1
            className="break-words text-xl font-bold leading-snug tracking-tight md:text-2xl"
            style={{ color: 'var(--first-octonary)' }}
          >
            {naslovZahtjeva}
          </h1>
        </div>
        {podnaslovKategorije ? (
          <p
            className="mt-1.5 text-sm font-medium leading-snug"
            style={{ color: 'var(--first-nonary)' }}
          >
            {podnaslovKategorije}
          </p>
        ) : null}
      </header>

      {/* Status row - tok bedž + hitnost chip + jedna rečenica opisa stanja */}
      <section className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex max-w-[min(100%,18rem)] shrink rounded-full px-3 py-1 text-xs font-semibold"
            style={korisnickiTokBedzStil(zahtjev)}
          >
            {korisnickiTokBedzTekst(zahtjev)}
          </span>
          <KorisnickaHitnostOutlinedChip score={score} prikaziPredgovor />
        </div>
        <p
          className="mt-3 text-base font-semibold leading-snug"
          style={{ color: 'var(--first-octonary)' }}
        >
          {hero.naslov}
        </p>
        <p
          className="mt-1 max-w-2xl text-sm leading-relaxed"
          style={{ color: 'var(--first-nonary)' }}
        >
          {hero.podnaslov}
        </p>
      </section>

      {/* 2 kolone: Lokacija i kontakt | Stanje zahtjeva */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section
          className={UNUTARNJI_PANEL_KLASA}
          style={{ borderColor: SEKCIJA_RAZDJELNIK_BOJA }}
          aria-label="Lokacija i kontakt"
        >
          <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
            Lokacija i kontakt
          </p>
          <div className="flex min-w-0 flex-col gap-3">
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
                {imaPreciznuLokaciju ? (
                  <div className="mt-2">
                    <PreciznaLokacijaChip compact />
                  </div>
                ) : null}
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
                  Kontakt telefon
                </p>
                {telefonHref ? (
                  <a
                    href={telefonHref}
                    className="font-semibold leading-snug underline-offset-2 hover:underline"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {telefon}
                  </a>
                ) : (
                  <p
                    className="font-semibold leading-snug"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {telefon}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className={UNUTARNJI_PANEL_KLASA}
          style={{ borderColor: SEKCIJA_RAZDJELNIK_BOJA }}
          aria-label="Stanje zahtjeva"
        >
          <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
            Stanje zahtjeva
          </p>
          <div className="flex min-w-0 flex-col gap-4">
            <div className="min-w-0">
              <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                Status
              </p>
              <p
                className="mt-1 text-sm font-semibold leading-snug"
                style={{ color: 'var(--first-octonary)' }}
              >
                {statusTekst}
              </p>
            </div>
            <div className="min-w-0">
              <p className={POLJE_OZNAKA_KLASA} style={POLJE_OZNAKA_BOJA}>
                Operativni prioritet
              </p>
              <p
                className="mt-1 text-sm font-semibold leading-snug"
                style={{ color: 'var(--first-octonary)' }}
              >
                {operativniTekst}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Termin - kompaktni mini timeline kao na dispečerskom detalju */}
      <section
        className="min-w-0 border-t pt-4"
        style={{ borderColor: SEKCIJA_RAZDJELNIK_BOJA }}
      >
        <p className={SEKCIJA_GRUPE_LABEL_KLASA} style={SEKCIJA_GRUPE_BOJA}>
          Termin
        </p>
        <ZahtjevMiniTimeline
          prijavljenoTekst={formatPrijavljenoDatumVrijeme(zahtjev.created_at)}
          terminTekst={terminTekst}
          kompakt
        />
      </section>

      {/* Poruka */}
      <section className="min-w-0">
        <p className={POPRATNA_LABEL_KLASA} style={POPRATNA_LABEL_BOJA}>
          Poruka uz prijavu
        </p>
        {opisSirovo ? (
          <>
            <ZahtjevKorisnickaPorukaBubble
              tekst={opisZaPrikaz}
              className="mt-2"
            />
            {porukaTrebaSkracivanje ? (
              <button
                type="button"
                className="mt-2 text-xs font-semibold underline-offset-2 hover:underline"
                style={{ color: 'var(--first-secondary)' }}
                onClick={onTogglePoruku}
              >
                {porukaProširena ? 'Sakrij' : 'Prikaži više'}
              </button>
            ) : null}
          </>
        ) : (
          <p
            className="mt-2 text-sm italic leading-relaxed"
            style={{ color: 'var(--first-nonary)' }}
          >
            Niste dodali dodatnu poruku uz ovu prijavu.
          </p>
        )}
      </section>

      {/* Galerija */}
      <section className="min-w-0">
        <p className={POPRATNA_LABEL_KLASA} style={POPRATNA_LABEL_BOJA}>
          Priložene slike
        </p>
        {slike.length > 0 ? (
          <div className="mt-2">
            <PrilogGalerija urls={slike} className="max-w-2xl" />
          </div>
        ) : (
          <p
            className="mt-2 text-[12px] leading-snug"
            style={{ color: 'rgb(var(--first-nonary-rgb) / 0.72)' }}
          >
            Nema priloženih slika
          </p>
        )}
      </section>
    </div>
  );
}
