'use client';

import Link from 'next/link';
import { AlertTriangle, Calendar, Image as ImageLucide, MapPin, Phone, Star } from 'lucide-react';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  formatPrijavljenoDatumVrijeme,
  hrefZaTelefon,
  imePrezimePodnosioca,
  preferiraniTerminZaDispecera,
  relativnoPrijavljenoZaDispecera,
  skracenTekst,
} from '@/lib/servisirane/zahtjevPrikaz';
import { urlsPrilozenihSlika } from '@/lib/servisirane/slikeZahtjeva';
import { bojaRelativnogPrijaveDispecera, DISPECER_PALETA_HITNOST, DISPECER_PALETA_PREMIUM } from '@/lib/servisirane/dispecerPaleta';
import { DispecerPregledTokaBadzevi } from '@/components/dispecer/DispecerPregledTokaBadzevi';
import { DispecerPremiumKruna, KorisnickaHitnostOutlinedChip, OperativniPrioritetChip } from '@/components/servisirane/zahtjevBadgeovi';
import type { ZahtjevZaDispecerskuKarticu } from '@/components/dispecer/DispecerskaZahtjevKartica';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { inboxGrupaIzKorisnickeProcjene, efektivniKorisnickiUrgencyScore } from '@/lib/servisirane/urgency';
import { oznakaZaDispecerskiPrikazBroja } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import {
  zahtjevCekaDogovorTerminaDispecera,
  zahtjevCekaDodjeluServiseraDispecera,
  zahtjevCekaZavrsnuPotvrduCarobnjaka,
  zahtjevJeNoviUPregleduDispecera,
} from '@/lib/servisirane/dispecerskeFaze';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';
import { SlaStatusBadge } from '@/components/dispecer/SlaStatusBadge';
import { PonovniCiklusBadge } from '@/components/servisirane/PonovniCiklusBadge';

function sljedecaAkcijaZaOperatera(zahtjev: ServisniZahtjev): string {
  if (zahtjevCekaObraduUInboxuDispecera(zahtjev.status)) {
    if (zahtjevJeNoviUPregleduDispecera(zahtjev)) return 'Sljedeće: postavite operativni prioritet.';
    if (zahtjevCekaDogovorTerminaDispecera(zahtjev)) return 'Sljedeće: dogovorite termin s korisnikom.';
    if (zahtjevCekaDodjeluServiseraDispecera(zahtjev)) return 'Sljedeće: odaberite servisera.';
    if (zahtjevCekaZavrsnuPotvrduCarobnjaka(zahtjev)) return 'Sljedeće: završite potvrdu u wizardu.';
    return 'Sljedeće: nastavite obradu u wizardu.';
  }
  if (zahtjev.status === 'potvrdeno') {
    if (zahtjev.serviser_odbio_razlog) return '⚠ Serviser odbio — odaberite drugog servisera.';
    return 'Sljedeće: dodjela serviseru ili start intervencije.';
  }
  return 'Sljedeće: pregledajte detalje i historiju.';
}

/** Mrežna kartica za dispečera - brz operativni pregled (US-07, US-12, US-13). */
export function DispecerskaZahtjevPregledGridKartica({ zahtjev }: { zahtjev: ZahtjevZaDispecerskuKarticu }) {
  const podnosilac = zahtjev.podnosilac;
  const { glavna, podkategorija } = labelKategorije(zahtjev);
  const opis = (zahtjev.description ?? '').trim();
  const problem = podkategorija || (opis ? skracenTekst(opis, 96) : 'Opis nije unesen');

  const termin = preferiraniTerminZaDispecera(zahtjev, { dispecerskiPregled: true });
  const imePrezime = imePrezimePodnosioca(podnosilac);
  const prijavljenoRel = relativnoPrijavljenoZaDispecera(zahtjev.created_at);
  const prijavljenoBoja = bojaRelativnogPrijaveDispecera(prijavljenoRel.ton);
  const grupaInboxa = inboxGrupaIzKorisnickeProcjene(zahtjev);
  const scoreZaPrikaz = efektivniKorisnickiUrgencyScore(zahtjev);
  const prijavljenoDatumPuno = formatPrijavljenoDatumVrijeme(zahtjev.created_at);
  const operativniPrioritetSirovo = (zahtjev.final_priority ?? '').trim();
  /** Isti vizuelni jezik kao {@link DispecerskaZahtjevKartica}: premium ili rub po korisničkoj hitnosti. */
  const lijeviRubKartice = zahtjev.is_premium
    ? DISPECER_PALETA_PREMIUM.akcent
    : DISPECER_PALETA_HITNOST[grupaInboxa].border;
  const telefonSirovo = podnosilac?.broj_telefona?.trim() || zahtjev.contact_phone?.trim() || '';
  const telefonHref = telefonSirovo ? hrefZaTelefon(telefonSirovo) : null;
  const imaKoordinate = zahtjev.latitude != null && zahtjev.longitude != null;
  const brojPrilozenihSlika = urlsPrilozenihSlika(
    zahtjev as ZahtjevZaDispecerskuKarticu & Record<string, unknown>,
  ).length;
  const korisnikJePrilozioSliku = brojPrilozenihSlika > 0;

  const detaljHref = `/dispecer/zahtjevi/${zahtjev.id}`;
  const jeOdbijen  = !!zahtjev.serviser_odbio_razlog;
  const ocjena     = zahtjev.intervencija_ocjene?.[0] ?? null;

  return (
    <article
      className="relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl shadow-sm transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-md"
      style={{
        backgroundColor: 'rgb(255 255 255 / 0.72)',
        borderStyle: 'solid',
        borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
        borderWidth: 1,
        borderLeftWidth: 4,
        borderLeftColor: lijeviRubKartice,
      }}
    >
      <Link
        href={detaljHref}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Otvori zahtjev #${oznakaZaDispecerskiPrikazBroja(zahtjev)}, ${glavna}`}
      />

      {/* Banner: serviser odbio — prikazuje se na vrhu kartice */}
      {jeOdbijen && (
        <div
          className="relative z-10 flex items-center gap-2 px-4 py-2 text-xs font-bold"
          style={{
            backgroundColor: 'rgba(220,38,38,0.09)',
            borderBottom: '1px solid rgba(220,38,38,0.18)',
            color: '#DC2626',
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            Serviser odbio — {zahtjev.serviser_odbio_razlog}
          </span>
        </div>
      )}

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col gap-0 p-4 text-left pointer-events-none">
        {/* Identitet + datum prijave (US-07 AC9) */}
        <div className="flex min-w-0 items-start justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="inline-flex w-fit shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums leading-none"
              style={{
                backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.2)',
                color: 'var(--first-octonary)',
                border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
              }}
            >
              #{oznakaZaDispecerskiPrikazBroja(zahtjev)}
            </span>
            {zahtjev.is_premium ? <DispecerPremiumKruna className="translate-y-px shrink-0" /> : null}
            {(zahtjev.broj_ponovnih_ciklusa ?? 0) > 0 && (
              <PonovniCiklusBadge broj={zahtjev.broj_ponovnih_ciklusa!} />
            )}
          </span>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}>
              Datum prijave
            </p>
            <p
              className="mt-0.5 text-xs font-semibold tabular-nums leading-snug sm:text-sm"
              style={{ color: 'var(--first-octonary)' }}
              title={prijavljenoRel.tooltipApsolutno}
            >
              {prijavljenoDatumPuno}
            </p>
            <p
              suppressHydrationWarning
              className={['mt-0.5 text-xs font-semibold leading-snug', prijavljenoRel.ton === 'stale' ? 'font-bold' : ''].join(' ')}
              style={{ color: prijavljenoBoja }}
              title={prijavljenoRel.tooltipApsolutno}
            >
              {prijavljenoRel.label}
            </p>
          </div>
        </div>

        {/* Status toka + operativni vs korisnička procjena (US-12, US-13, US-07 AC12) - usklađeno s kontrolnom tablom */}
        <div
          className="mt-3 min-w-0 space-y-2 border-t pt-3 pointer-events-auto"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.22)' }}
        >
          <div className="min-w-0">
            <DispecerPregledTokaBadzevi zahtjev={zahtjev} />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
            {operativniPrioritetSirovo && (
              <OperativniPrioritetChip vrijednost={operativniPrioritetSirovo} />
            )}
            <KorisnickaHitnostOutlinedChip score={scoreZaPrikaz} />
            <SlaStatusBadge
              createdAt={zahtjev.created_at}
              prioritet={zahtjev.final_priority ?? null}
              status={zahtjev.status}
              prikaziVrijeme
            />
          </div>
        </div>

        {/* Kategorija, problem, korisnik */}
        <div className="mt-3 min-w-0 space-y-1 border-t pt-3" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.22)' }}>
          <h2
            className="text-lg font-bold leading-snug sm:text-xl"
            style={{ color: 'var(--first-octonary)' }}
            title={glavna}
          >
            {glavna}
          </h2>
          <p className="text-sm font-semibold leading-snug sm:text-base" style={{ color: 'var(--first-octonary)' }}>
            {problem}
          </p>
          <p className="text-sm font-medium leading-snug" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.92)' }}>
            {imePrezime}
          </p>
        </div>

        {/* Adresa i kontakt */}
        <div
          className="mt-3 min-w-0 space-y-3 rounded-xl px-3 py-3 sm:px-3.5"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.28)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.25)',
          }}
        >
          <div>
            <p className="mb-1 text-xs font-medium" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.85)' }}>
              Adresa
            </p>
            <div className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--first-secondary)' }} aria-hidden />
              <div className="pointer-events-auto min-w-0 flex-1 text-sm font-semibold leading-snug" style={{ color: 'var(--first-octonary)' }}>
                <p className="whitespace-pre-wrap break-words">{(zahtjev.address ?? '').trim() || '-'}</p>
              </div>
            </div>
            {imaKoordinate ? (
              <p className="mt-1.5 pl-6 text-[11px] font-medium" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.8)' }}>
                GPS lokacija na mapi
              </p>
            ) : null}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.85)' }}>
              Kontakt
            </p>
            {telefonHref ? (
              <a
                href={telefonHref}
                className="pointer-events-auto inline-flex max-w-full items-center gap-2 text-sm font-semibold underline-offset-2 hover:underline"
                style={{ color: 'var(--first-secondary)' }}
                title={telefonSirovo}
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <span className="tabular-nums">{telefonSirovo}</span>
              </a>
            ) : (
              <p className="text-sm font-medium" style={{ color: 'var(--first-nonary)' }}>
                -
              </p>
            )}
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 basis-0" aria-hidden />

        {/* Termin, sljedeći korak, prilog (status je već u zoni toka iznad - bez duplog bedža) */}
        <div
          className="mt-3 w-full space-y-3 border-t pt-3"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}
        >
          <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.75)' }} aria-hidden />
            {!termin.imaPreferirani ? (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}>
                  Preferirani termin:{' '}
                </span>
                <span
                  className="inline-flex max-w-full rounded-md border px-2 py-1 text-xs font-semibold leading-snug"
                  style={{
                    color: 'var(--first-secondary)',
                    backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.07)',
                    borderColor: 'rgb(var(--first-secondary-rgb) / 0.25)',
                  }}
                >
                  {termin.tekstCijeli}
                </span>
              </div>
            ) : (
              <p className="min-w-0 flex-1 text-sm font-semibold leading-snug" style={{ color: 'var(--first-octonary)' }}>
                <span className="font-medium" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}>
                  Preferirani termin:{' '}
                </span>
                {termin.tekstCijeli}
              </p>
            )}
          </div>

          <p className="text-xs font-medium leading-relaxed" style={{ color: 'rgb(var(--first-nonary-rgb) / 0.9)' }}>
            {sljedecaAkcijaZaOperatera(zahtjev)}
          </p>

          {zahtjev.status === 'zatvoreno' && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ backgroundColor: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              <Star className="h-3.5 w-3.5 shrink-0" style={{ color: '#CA8A04' }} aria-hidden />
              {ocjena ? (
                <>
                  <span className="inline-flex gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className="h-3 w-3" strokeWidth={1.5}
                        fill={n <= ocjena.ocjena ? '#FBBF24' : 'transparent'}
                        style={{ color: n <= ocjena.ocjena ? '#FBBF24' : 'rgba(234,179,8,0.3)' }} />
                    ))}
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: '#92400E' }}>
                    {ocjena.ocjena}/5
                  </span>
                  {ocjena.komentar && (
                    <span className="truncate text-xs italic" style={{ color: '#A16207' }}>
                      &ldquo;{ocjena.komentar}&rdquo;
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs" style={{ color: '#A16207' }}>Bez ocjene</span>
              )}
            </div>
          )}

          <div
            className="flex items-center gap-2 border-t pt-3"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.2)' }}
          >
            <ImageLucide
              className="h-4 w-4 shrink-0"
              style={{
                color: korisnikJePrilozioSliku ? 'var(--first-secondary)' : 'rgb(var(--first-nonary-rgb) / 0.5)',
              }}
              aria-hidden
            />
            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--first-octonary)' }}>
              {korisnikJePrilozioSliku
                ? brojPrilozenihSlika === 1
                  ? 'Korisnik je priložio sliku.'
                  : 'Korisnik je priložio više slika.'
                : 'Korisnik nije priložio sliku.'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
