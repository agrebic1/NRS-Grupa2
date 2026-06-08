'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  FileText,
  CalendarClock,
  ClipboardList,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { korisnickaHitnostStil } from '@/components/servisirane/zahtjevBadgeovi';
import { DispecerPremiumKruna } from '@/components/servisirane/zahtjevBadgeovi';
import type { KorisnickiDashboardStatus } from '@/lib/servisirane/statusZahtjeva';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import {
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
  DISPECER_PALETA_STATUS,
} from '@/lib/servisirane/dispecerPaleta';
import { KORISNIK_PALETA_DASHBOARD_STATUS } from '@/lib/servisirane/statusBoja';
import {
  efektivniKorisnickiUrgencyScore,
  inboxGrupaIzKorisnickeProcjene,
  oznakaInboxHitnostiCekaObradu,
} from '@/lib/servisirane/urgency';

export interface KorisnikDashboardZahtjev {
  id: string;
  /** Redni broj zahtjeva korisnika (1 = najstariji). */
  korisnickiBroj: number;
  naslov: string;
  status: KorisnickiDashboardStatus;
  datum: string;
  lokacija: string;
  /** yyyy-mm-dd - prikaz u sidebaru „Sljedeći dolazak“. */
  dolazakDatumIso: string;
  /** Opseg sati npr. „08:00-12:00“ ili null → „Vrijeme nije potvrđeno“. */
  dolazakVrijemeOpis: string | null;
  /** Za prikaz „X hitnost (čeka obradu)” kad je {@link KorisnickiDashboardStatus} `novi`. */
  is_premium: boolean;
  urgency_score: number;
  /** US-47: broj operativnih ponovnih dodjela - prikazuje se kad je status `potvrdeno` i > 0. */
  broj_ponovnih_ciklusa?: number;
}

interface KorisnikPregledDashboardProps {
  imeKorisnika: string;
  zahtjevi: KorisnikDashboardZahtjev[];
}

const BADGE_OZNAKE: Record<KorisnickiDashboardStatus, string> = {
  novi: 'Novi',
  u_obradi: 'Dispečer obrađuje',
  potvrdeno: 'Serviser dodijeljen',
  u_toku: 'Servis u toku',
  zavrseno: 'Završeno',
  zatvoreno: 'Zatvoreno',
  otkazano: 'Otkazano',
  odbijeno: 'Odbijeno',
};

function tekstOznakeBedzaDashboard(z: KorisnikDashboardZahtjev): string {
  if (z.status === 'novi') {
    return oznakaInboxHitnostiCekaObradu(z);
  }
  if (z.status === 'potvrdeno' && (z.broj_ponovnih_ciklusa ?? 0) > 0) {
    return 'Na ponovnoj dodjeli';
  }
  return BADGE_OZNAKE[z.status];
}

/** Bedž statusa - za `novi` hitnosna paleta po urgency_score-u korisnika. */
function stilStatusBedzaZaDashboard(
  z: KorisnikDashboardZahtjev,
): CSSProperties {
  if (z.status === 'novi') {
    const score = efektivniKorisnickiUrgencyScore(z);
    const { boja, pozadina, border } = korisnickaHitnostStil(score);
    return {
      backgroundColor: pozadina,
      color: boja,
      border: `1px solid ${border}`,
    };
  }
  type NonNoviStatus = Exclude<KorisnickiDashboardStatus, 'novi'>;
  const slot = KORISNIK_PALETA_DASHBOARD_STATUS[z.status as NonNoviStatus];
  return { backgroundColor: slot.pozadina, color: slot.boja };
}

/** Lijevi rub kartice - kao {@link ZahtjevKartica}: premium ili inbox grupa po procjeni. */
function lijeviRubKorisnickaKartica(z: KorisnikDashboardZahtjev): string {
  if (z.is_premium) return DISPECER_PALETA_PREMIUM.akcent;
  const grupa = inboxGrupaIzKorisnickeProcjene(z);
  return DISPECER_PALETA_HITNOST[grupa].border;
}

function jeZavrsenKaoIntervencija(status: KorisnickiDashboardStatus) {
  return status === 'zavrseno';
}

function jeTerminalniKorisnicki(status: KorisnickiDashboardStatus) {
  return (
    status === 'zavrseno' ||
    status === 'zatvoreno' ||
    status === 'otkazano' ||
    status === 'odbijeno'
  );
}

/** Kartice u „Moji zahtjevi” - sve aktivne (čeka obradu, potvrđeno, na terenu); bez završenih i terminalnih. */
function jeZahtjevCekaObraduZaPregled(
  status: KorisnickiDashboardStatus,
): boolean {
  return (
    status === 'novi' ||
    status === 'u_obradi' ||
    status === 'potvrdeno' ||
    status === 'u_toku'
  );
}

function brojAktivnih(zahtjevi: KorisnikDashboardZahtjev[]) {
  return zahtjevi.filter((z) => !jeTerminalniKorisnicki(z.status)).length;
}

/** Broj zahtjeva s visokim urgency_score-om (korisnikova samoprocjena hitnosti). */
function brojHitnih(zahtjevi: KorisnikDashboardZahtjev[]) {
  return zahtjevi.filter((z) => z.urgency_score >= 80).length;
}

function sljedeciZahtjev(
  zahtjevi: KorisnikDashboardZahtjev[],
): KorisnikDashboardZahtjev | null {
  const uToku = zahtjevi.find((z) => z.status === 'u_toku');
  if (uToku) return uToku;
  const potvrdeno = zahtjevi.find((z) => z.status === 'potvrdeno');
  if (potvrdeno) return potvrdeno;
  const uObradi = zahtjevi.find((z) => z.status === 'u_obradi');
  if (uObradi) return uObradi;
  return zahtjevi.find((z) => z.status === 'novi') ?? null;
}

function SljedeciDolazakAdresa({ lokacija }: { lokacija: string }) {
  const puna = (lokacija ?? '').trim();
  if (!puna || puna === 'Lokacija nije unesena') {
    return (
      <p
        className="text-xs"
        style={{ color: 'rgb(var(--first-nonary-rgb) / 0.85)' }}
      >
        Lokacija nije unesena
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p
        className="break-words text-sm font-semibold leading-snug"
        style={{ color: 'var(--first-octonary)' }}
      >
        {puna}
      </p>
    </div>
  );
}

function sortirajZahtjeve(zahtjevi: KorisnikDashboardZahtjev[]) {
  const prioritet: Record<KorisnickiDashboardStatus, number> = {
    u_toku: 0,
    potvrdeno: 1,
    u_obradi: 2,
    novi: 3,
    zavrseno: 4,
    zatvoreno: 5,
    otkazano: 6,
    odbijeno: 7,
  };
  return [...zahtjevi].sort(
    (a, b) => prioritet[a.status] - prioritet[b.status],
  );
}

/** Kartica za pregled dashboarda - layout kao {@link ZahtjevKartica} na stranici „Moji zahtjevi“. */
function ZahtjevPregledKartica({
  zahtjev,
}: {
  zahtjev: KorisnikDashboardZahtjev;
}) {
  const oznakaStatusa = tekstOznakeBedzaDashboard(zahtjev);
  const rubLijevo = lijeviRubKorisnickaKartica(zahtjev);

  return (
    <Link
      href={`/korisnik/zahtjevi/${zahtjev.id}`}
      className="group block h-full min-w-0"
    >
      <article
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm transition-[box-shadow,border-color] duration-200 ease-out group-hover:shadow-md"
        style={{
          backgroundColor: 'rgb(255 255 255 / 0.72)',
          borderStyle: 'solid',
          borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
          borderWidth: 1,
          borderLeftWidth: 4,
          borderLeftColor: rubLijevo,
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col px-3 py-3 sm:px-4">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <span className="inline-flex max-w-full shrink-0 items-center gap-1.5">
              <span
                className="inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
                style={{
                  backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.2)',
                  color: 'var(--first-octonary)',
                  border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
                }}
              >
                #{zahtjev.korisnickiBroj}
              </span>
              {zahtjev.is_premium ? (
                <DispecerPremiumKruna className="translate-y-px" />
              ) : null}
            </span>
            <span
              className="inline-flex max-w-[min(100%,11rem)] shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-tight sm:max-w-none"
              style={stilStatusBedzaZaDashboard(zahtjev)}
            >
              {oznakaStatusa}
            </span>
          </div>

          <p
            className="mt-3 break-words text-sm font-semibold leading-snug"
            style={{ color: 'var(--first-octonary)' }}
          >
            {zahtjev.naslov}
          </p>

          {zahtjev.status === 'u_obradi' ? (
            <p
              className="mt-2 text-[11px] leading-snug"
              style={{ color: 'rgb(var(--first-nonary-rgb) / 0.88)' }}
            >
              Dispečer određuje prioritet i termin. Izmjena i otkazivanje nisu
              mogući.
            </p>
          ) : zahtjev.status === 'potvrdeno' &&
            (zahtjev.broj_ponovnih_ciklusa ?? 0) > 0 ? (
            <p
              className="mt-2 text-[11px] leading-snug"
              style={{ color: '#B45309' }}
            >
              Prethodni serviser nije riješio zahtjev - dispečer traži novog
              servisera.
            </p>
          ) : zahtjev.status === 'potvrdeno' ? (
            <p
              className="mt-2 text-[11px] leading-snug"
              style={{ color: 'rgb(0,100,160 / 0.85)' }}
            >
              Serviser je dodijeljen - uskoro ćete dobiti potvrdu termina.
            </p>
          ) : null}

          <div className="mt-2 min-w-0">
            <p
              className="break-words text-sm font-medium leading-snug"
              style={{ color: 'var(--first-nonary)' }}
            >
              {(zahtjev.lokacija ?? '').trim() || '-'}
            </p>
          </div>

          <div
            className="mt-3 flex min-w-0 items-center gap-1.5 text-xs"
            style={{ color: 'var(--first-nonary)' }}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span>
              Prijavljeno{' '}
              <span className="font-medium tabular-nums">{zahtjev.datum}</span>
            </span>
          </div>

          <div className="mt-auto pt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-deep-teal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-celestial-teal">
            Detalji
            <ChevronRight className="h-4 w-4" aria-hidden />
          </div>
        </div>
      </article>
    </Link>
  );
}

const cardShell = {
  backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.5)',
  border: '1px solid rgb(var(--first-quaternary-rgb) / 0.45)',
  boxShadow: '0 10px 28px rgb(var(--first-primary-rgb) / 0.06)',
} as const;

/** Broj kartica po stranici na pregledu (iznad toga - paginacija). */
const ZAHTJEVI_PO_STRANICI_PREGLED = 4;

export function KorisnikPregledDashboard({
  imeKorisnika = 'Korisnik',
  zahtjevi = [],
}: Partial<KorisnikPregledDashboardProps>) {
  const aktivnih = brojAktivnih(zahtjevi);
  const hitnih = brojHitnih(zahtjevi);
  const sljedeci = sljedeciZahtjev(zahtjevi);
  const zahtjeviZaPregledMoji = zahtjevi.filter((z) =>
    jeZahtjevCekaObraduZaPregled(z.status),
  );
  const cekaObraduBroj = zahtjeviZaPregledMoji.length;
  const lista = sortirajZahtjeve(zahtjeviZaPregledMoji);
  const zavrsenih = zahtjevi.filter((z) =>
    jeZavrsenKaoIntervencija(z.status),
  ).length;

  const ukupnoStranicaMojiZahtjevi = Math.max(
    1,
    Math.ceil(lista.length / ZAHTJEVI_PO_STRANICI_PREGLED),
  );
  const [stranicaMojiZahtjevi, setStranicaMojiZahtjevi] = useState(1);

  /** Koriguje indeks ako je izvan raspona (npr. manje zahtjeva nakon osvježavanja) - inače slice() može biti prazan. */
  const aktivnaStranicaMojiZahtjevi = Math.min(
    Math.max(1, stranicaMojiZahtjevi),
    ukupnoStranicaMojiZahtjevi,
  );

  useEffect(() => {
    setStranicaMojiZahtjevi((prev) =>
      Math.min(prev, ukupnoStranicaMojiZahtjevi),
    );
  }, [ukupnoStranicaMojiZahtjevi]);

  const listaMojiZahtjeviZaPrikaz =
    lista.length <= ZAHTJEVI_PO_STRANICI_PREGLED
      ? lista
      : lista.slice(
          (aktivnaStranicaMojiZahtjevi - 1) * ZAHTJEVI_PO_STRANICI_PREGLED,
          aktivnaStranicaMojiZahtjevi * ZAHTJEVI_PO_STRANICI_PREGLED,
        );

  const prikaziPaginacijuMojiZahtjevi =
    lista.length > ZAHTJEVI_PO_STRANICI_PREGLED;

  const KPI = [
    {
      oznaka: 'Aktivnih zahtjeva',
      vrijednost: aktivnih,
      boja: 'var(--first-secondary)',
      Ikona: ClipboardList,
    },
    {
      oznaka: 'Visoka hitnost (čeka obradu)',
      vrijednost: hitnih,
      boja: DISPECER_PALETA_HITNOST.Hitno.tekst,
      Ikona: AlertTriangle,
    },
    /** Isti skup kao kartice u „Moji zahtjevi“ ispod (inbox + dispečer). */
    {
      oznaka: 'Čeka obradu',
      vrijednost: cekaObraduBroj,
      boja: DISPECER_PALETA_STATUS.inbox.kpi,
      Ikona: Inbox,
    },
    {
      oznaka: 'Završenih intervencija',
      vrijednost: zavrsenih,
      boja: DISPECER_PALETA_STATUS.terminPotvrden.kpi,
      Ikona: CheckCircle,
    },
  ];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full opacity-40 blur-3xl md:block"
        style={{ background: 'rgb(var(--first-septenary-rgb) / 0.12)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full opacity-35 blur-3xl md:block"
        style={{ background: 'rgb(var(--first-secondary-rgb) / 0.1)' }}
        aria-hidden
      />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: 'var(--first-octonary)' }}
            >
              Dobrodošli, {imeKorisnika}!
            </h1>
            <p
              className="mt-1.5 max-w-xl text-sm leading-relaxed"
              style={{ color: 'var(--first-nonary)' }}
            >
              Ovdje pratite svoje zahtjeve, hitne slučajeve i zakazane dolaske
              servisera - bez poziva i ručnih tablica.
            </p>
          </div>
          <Link href="/korisnik/zahtjevi/novi" className="shrink-0">
            <Button size="md" className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Prijavi novi kvar
            </Button>
          </Link>
        </div>

        {/* KPI - ista skala boja kao dispečerski inbox / hitnost / termin; 4 kolone na lg */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI.map(({ oznaka, vrijednost, boja, Ikona }) => (
            <div
              key={oznaka}
              title={oznaka}
              className="flex items-center gap-4 rounded-3xl p-5 transition-shadow duration-200 hover:shadow-md"
              style={cardShell}
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${boja} 13%, transparent)`,
                }}
              >
                <Ikona className="h-5 w-5" style={{ color: boja }} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: boja }}
                >
                  {vrijednost}
                </p>
                <p
                  className="text-xs leading-snug"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  {oznaka}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Glavna kolona ~66% */}
          <div className="min-w-0 lg:col-span-8">
            <div
              id="moji-zahtjevi-lista"
              className="scroll-mt-24 rounded-2xl shadow-card"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
                border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
              }}
            >
              <div
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderBottom:
                    '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
                }}
              >
                <div>
                  <h2
                    className="font-semibold"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    Moji zahtjevi
                  </h2>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Samo zahtjevi koji čekaju obradu (red čekanja i dispečer).
                    Na terenu i završeni - u „Svi zahtjevi“.
                  </p>
                </div>
                <Link
                  href="/korisnik/zahtjevi"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--first-secondary)' }}
                >
                  Svi zahtjevi <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {zahtjevi.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                  <FileText
                    className="h-10 w-10"
                    style={{ color: 'var(--first-quinary)' }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Nemate još nijednog zahtjeva.
                  </p>
                  <Link href="/korisnik/zahtjevi/novi">
                    <Button size="sm" variant="secondary">
                      Prijavi prvi kvar
                    </Button>
                  </Link>
                </div>
              ) : lista.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                  <FileText
                    className="h-10 w-10"
                    style={{ color: 'var(--first-quinary)' }}
                  />
                  <p
                    className="max-w-md text-sm leading-relaxed"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Trenutno nemate zahtjeva koji čekaju obradu - svi su na
                    terenu ili završeni. Pogledajte cjelokupnu historiju na
                    listi zahtjeva.
                  </p>
                  <Link href="/korisnik/zahtjevi">
                    <Button size="sm" variant="secondary">
                      Svi zahtjevi
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                    {listaMojiZahtjeviZaPrikaz.map((zahtjev) => (
                      <ZahtjevPregledKartica
                        key={zahtjev.id}
                        zahtjev={zahtjev}
                      />
                    ))}
                  </div>

                  {prikaziPaginacijuMojiZahtjevi ? (
                    <nav
                      className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      style={{
                        borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
                        backgroundColor:
                          'rgb(var(--first-quaternary-rgb) / 0.18)',
                      }}
                      aria-label="Stranice liste zahtjeva na pregledu"
                    >
                      <p
                        className="text-center text-xs tabular-nums sm:text-left"
                        style={{ color: 'var(--first-nonary)' }}
                      >
                        Stranica{' '}
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--first-octonary)' }}
                        >
                          {aktivnaStranicaMojiZahtjevi}
                        </span>{' '}
                        od{' '}
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--first-octonary)' }}
                        >
                          {ukupnoStranicaMojiZahtjevi}
                        </span>
                        <span className="hidden sm:inline">
                          {' '}
                          ({lista.length} zahtjeva)
                        </span>
                      </p>
                      <div className="flex items-center justify-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                          style={{
                            borderColor:
                              'rgb(var(--first-quaternary-rgb) / 0.4)',
                            color: 'var(--first-octonary)',
                            backgroundColor: 'rgb(255 255 255 / 0.6)',
                          }}
                          disabled={aktivnaStranicaMojiZahtjevi <= 1}
                          onClick={() =>
                            setStranicaMojiZahtjevi((prev) => {
                              const trenutno = Math.min(
                                Math.max(1, prev),
                                ukupnoStranicaMojiZahtjevi,
                              );
                              return Math.max(1, trenutno - 1);
                            })
                          }
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden />
                          Prethodna
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                          style={{
                            borderColor:
                              'rgb(var(--first-quaternary-rgb) / 0.4)',
                            color: 'var(--first-octonary)',
                            backgroundColor: 'rgb(255 255 255 / 0.6)',
                          }}
                          disabled={
                            aktivnaStranicaMojiZahtjevi >=
                            ukupnoStranicaMojiZahtjevi
                          }
                          onClick={() =>
                            setStranicaMojiZahtjevi((prev) => {
                              const trenutno = Math.min(
                                Math.max(1, prev),
                                ukupnoStranicaMojiZahtjevi,
                              );
                              return Math.min(
                                ukupnoStranicaMojiZahtjevi,
                                trenutno + 1,
                              );
                            })
                          }
                        >
                          Sljedeća
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </nav>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Sidebar ~33% */}
          <aside className="flex w-full flex-col gap-4 lg:col-span-4">
            <div className="rounded-3xl p-5" style={cardShell}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock
                  className="h-5 w-5"
                  style={{ color: 'var(--first-septenary)' }}
                />
                <h3
                  className="font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Sljedeći dolazak
                </h3>
              </div>
              {sljedeci ? (
                <>
                  <p
                    className="text-[11px] font-semibold tabular-nums uppercase tracking-wide"
                    style={{ color: 'rgb(var(--first-nonary-rgb) / 0.82)' }}
                  >
                    Zahtjev #{sljedeci.korisnickiBroj}
                  </p>
                  <p
                    className="mt-2 text-sm font-semibold leading-snug"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {sljedeci.naslov}
                  </p>

                  <div className="mt-3">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}
                    >
                      Status
                    </p>
                    <div className="mt-1">
                      <span
                        className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={stilStatusBedzaZaDashboard(sljedeci)}
                      >
                        {tekstOznakeBedzaDashboard(sljedeci)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}
                    >
                      Datum dolaska
                    </p>
                    <p
                      className="mt-1 text-2xl font-bold tabular-nums leading-tight tracking-tight sm:text-[1.65rem]"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      {formatirajDatumPrikaz(sljedeci.dolazakDatumIso, '-')}
                    </p>
                    <p
                      className="mt-1.5 text-sm font-medium"
                      style={{ color: 'rgb(var(--first-nonary-rgb) / 0.9)' }}
                    >
                      {sljedeci.dolazakVrijemeOpis ?? 'Vrijeme nije potvrđeno'}
                    </p>
                  </div>

                  <div>
                    <p
                      className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: 'rgb(var(--first-nonary-rgb) / 0.78)' }}
                    >
                      Lokacija
                    </p>
                    <SljedeciDolazakAdresa lokacija={sljedeci.lokacija} />
                  </div>

                  <Link
                    href={`/korisnik/zahtjevi/${sljedeci.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-soft-beige bg-transparent px-5 py-2 text-sm font-semibold text-deep-teal transition-colors hover:border-celestial-teal hover:bg-celestial-teal/5 focus:outline-none focus:ring-2 focus:ring-celestial-teal/40 focus:ring-offset-2"
                  >
                    Detalji zahtjeva
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgb(var(--first-nonary-rgb) / 0.85)' }}
                >
                  Nema zakazanih dolazaka.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
