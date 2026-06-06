'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type { ZahtjevZaDispecerskuKarticu } from '@/components/dispecer/DispecerskaZahtjevKartica';
import { DispecerskaZahtjevPregledGridKartica } from '@/components/dispecer/DispecerskaZahtjevPregledGridKartica';
import { kreirajKlijenta } from '@/lib/supabase/klijent';
import { rangOperativnogPrioriteta } from '@/lib/servisirane/operativniPrioritet';
import {
  normalizujDispecerFilterIzParametra,
  zahtjevJeNoviUPregleduDispecera,
  zahtjevJeUObradiSirokoGledano,
  zahtjevJePotvrdenPrijeIntervencije,
  zahtjevUFaziDodjeleServiseraPregled,
  zahtjevUFaziDogovoraTerminaPregled,
  zahtjevUFaziKorakaPotvrdePregled,
} from '@/lib/servisirane/dispecerskeFaze';
import { sastaviDispecerskiInboxRedoslijed } from '@/lib/servisirane/urgency';

// ─── Konfiguracija filtera ────────────────────────────────────────────────────

const ZAHTJEVA_PO_STRANICI = 12;

/** Opcije glavnog filtera statusa zahtjeva — usklađeno s KPI pločicama na dashboardu. */
const STATUS_FILTRI = [
  { value: 'svi',       label: 'Sve',        title: 'Svi aktivni zahtjevi bez obzira na status.' },
  { value: 'novi',      label: 'Novi',        title: 'Zahtjevi koji još čekaju procjenu dispečera (nije postavljen operativni prioritet).' },
  { value: 'u_obradi',  label: 'U obradi',   title: 'Svi zahtjevi u obradi - od procjene do dodjele servisera.' },
  { value: 'odbijeni',  label: 'Odbijeni',   title: 'Zahtjevi koje je serviser odbio — čekaju ponovnu dodjelu.' },
  { value: 'potvrdeni', label: 'Potvrđeni',  title: 'Zahtjevi kojima je završena obrada u wizardu i čekaju dodjelu servisera.' },
  { value: 'na_terenu', label: 'Na terenu',  title: 'Aktivne intervencije — serviseri dodijeljeni ili na lokaciji.' },
  { value: 'zavrseni',  label: 'Završeni',   title: 'Sve završene i formalno zatvorene intervencije.' },
  {
    value: 'ponovni_ciklus',
    label: 'Ponovni ciklusi',
    title: 'Intervencije vraćene na obradu ili označene kao nije riješene (više od jednog ciklusa).',
  },
] as const;

type StatusFilter = typeof STATUS_FILTRI[number]['value'];

/** Opcije filtera faze obrade - prikazuju se samo kada je odabran status "U obradi". */
const FAZA_FILTRI = [
  { value: 'sve_faze',         label: 'Sve faze',         title: 'Prikaz svih zahtjeva u obradi bez obzira na fazu.' },
  { value: 'procjena_zahtjeva', label: 'Procjena zahtjeva', title: 'Faza 1 - Dispečer još nije postavio operativni prioritet.' },
  { value: 'dogovor_termina',  label: 'Dogovor termina',   title: 'Faza 2 - Prioritet je postavljen; treba dogovoriti termin s korisnikom.' },
  { value: 'izbor_servisera',  label: 'Izbor servisera',   title: 'Faza 3 - Termin je unesen; treba odabrati servisera.' },
  { value: 'potvrda_termina',  label: 'Potvrda termina',   title: 'Faza 4 - Serviser je odabran; čeka se završna potvrda u wizardu.' },
] as const;

type FazaFilter = typeof FAZA_FILTRI[number]['value'];

const DOZVOLJENI_STATUS_FILTRI = STATUS_FILTRI.map((f) => f.value);
const DOZVOLJENE_FAZE          = FAZA_FILTRI.map((f) => f.value);

/** Statusi koji koriste inbox-redoslijed za sortiranje. */
const INBOX_REDOSLIJED_STATUSI = new Set<StatusFilter>(['svi', 'novi', 'u_obradi', 'odbijeni']);

// ─── Logika filtriranja ───────────────────────────────────────────────────────

function filterPoStatusu(
  zahtjevi: ZahtjevZaDispecerskuKarticu[],
  statusFilter: string,
): ZahtjevZaDispecerskuKarticu[] {
  switch (statusFilter) {
    case 'novi':      return zahtjevi.filter(zahtjevJeNoviUPregleduDispecera);
    case 'u_obradi':  return zahtjevi.filter(zahtjevJeUObradiSirokoGledano);
    case 'odbijeni':  return zahtjevi.filter(
      (z) => z.status === 'potvrdeno' && !!z.serviser_odbio_razlog
    );
    case 'potvrdeni': return zahtjevi.filter(
      (z) => zahtjevJePotvrdenPrijeIntervencije(z) && !z.serviser_odbio_razlog
    );
    case 'na_terenu': return zahtjevi.filter(
      (z) => ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(z.status)
    );
    case 'zavrseni':  return zahtjevi.filter(
      (z) => z.status === 'zavrseno' || z.status === 'zatvoreno'
    );
    case 'ponovni_ciklus':
      return zahtjevi.filter((z) => (z.broj_ponovnih_ciklusa ?? 0) > 1);
    default: // 'svi' — isključuje završene da ne preplavi aktivni prikaz
      return zahtjevi.filter(
        (z) => z.status !== 'zavrseno' && z.status !== 'zatvoreno'
      );
  }
}

function filterPoFazi(
  zahtjevi: ZahtjevZaDispecerskuKarticu[],
  fazaFilter: string,
): ZahtjevZaDispecerskuKarticu[] {
  switch (fazaFilter) {
    case 'procjena_zahtjeva': return zahtjevi.filter(zahtjevJeNoviUPregleduDispecera);
    case 'dogovor_termina':   return zahtjevi.filter(zahtjevUFaziDogovoraTerminaPregled);
    case 'izbor_servisera':   return zahtjevi.filter(zahtjevUFaziDodjeleServiseraPregled);
    case 'potvrda_termina':   return zahtjevi.filter(zahtjevUFaziKorakaPotvrdePregled);
    default:                  return zahtjevi; // 'sve_faze'
  }
}

function filtrirajZahtjeve(
  zahtjevi: ZahtjevZaDispecerskuKarticu[],
  statusFilter: string,
  fazaFilter: string,
): ZahtjevZaDispecerskuKarticu[] {
  const poStatusu = filterPoStatusu(zahtjevi, statusFilter);
  // Faza-filter se primjenjuje samo za "U obradi" kontekst
  if (statusFilter === 'u_obradi' && fazaFilter && fazaFilter !== 'sve_faze') {
    return filterPoFazi(poStatusu, fazaFilter);
  }
  return poStatusu;
}

// ─── Komponente filter traka ──────────────────────────────────────────────────

function StatusFilterTraka({
  aktivan,
  zahtjevi,
  onPromjena,
}: {
  aktivan: string;
  zahtjevi: ZahtjevZaDispecerskuKarticu[];
  onPromjena: (v: string) => void;
}) {
  return (
    <div
      className="inline-flex min-w-full gap-1.5 rounded-xl p-1 sm:min-w-0"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.24)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
      role="tablist"
      aria-label="Filter statusa zahtjeva"
    >
      {STATUS_FILTRI.map((opcija) => {
        const br      = filterPoStatusu(zahtjevi, opcija.value).length;
        const aktiv   = opcija.value === aktivan;
        const jeOdbij = opcija.value === 'odbijeni';
        // Boja po tipu taba — crvena za Odbijeni, narandžasta za Na terenu, plava za ostale
        const boja =
          jeOdbij ? '#DC2626'
          : opcija.value === 'na_terenu' ? 'var(--first-secondary)'
          : 'var(--first-secondary)';
        const bojaPoz =
          jeOdbij ? 'rgba(220,38,38,0.12)'
          : 'rgb(var(--first-secondary-rgb) / 0.12)';
        const bojaBorder =
          jeOdbij ? '1px solid rgba(220,38,38,0.35)'
          : '1px solid rgb(var(--first-secondary-rgb) / 0.35)';
        const bojaBadge =
          jeOdbij ? 'rgba(220,38,38,0.15)'
          : 'rgb(var(--first-secondary-rgb) / 0.15)';
        // Neaktivna boja teksta — crvena za Odbijeni ako ima stavki
        const neaktivnaBoja = jeOdbij && br > 0 ? '#DC2626' : 'var(--first-nonary)';
        const neaktivnaBadgePoz = jeOdbij && br > 0 ? 'rgba(220,38,38,0.1)' : 'rgb(var(--first-quaternary-rgb) / 0.35)';

        return (
          <button
            key={opcija.value}
            type="button"
            role="tab"
            aria-selected={aktiv}
            title={opcija.title}
            onClick={() => onPromjena(opcija.value)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm"
            style={{
              backgroundColor: aktiv ? bojaPoz : 'transparent',
              color:           aktiv ? boja : neaktivnaBoja,
              border:          aktiv ? bojaBorder : '1px solid transparent',
            }}
          >
            {opcija.label}
            {opcija.value !== 'svi' && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums"
                style={{
                  backgroundColor: aktiv ? bojaBadge : neaktivnaBadgePoz,
                  color:           aktiv ? boja : neaktivnaBoja,
                }}
              >
                {br}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FazaFilterTraka({
  aktivan,
  zahtjeviUObradi,
  onPromjena,
}: {
  aktivan: string;
  zahtjeviUObradi: ZahtjevZaDispecerskuKarticu[];
  onPromjena: (v: string) => void;
}) {
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>
          Faza obrade
        </span>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
          aria-hidden
        />
      </div>
      <div
        className="inline-flex min-w-full flex-wrap gap-1 rounded-xl p-1 sm:min-w-0"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.14)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.25)',
        }}
        role="tablist"
        aria-label="Filter faze obrade"
      >
        {FAZA_FILTRI.map((opcija) => {
          const br    = opcija.value === 'sve_faze'
            ? zahtjeviUObradi.length
            : filterPoFazi(zahtjeviUObradi, opcija.value).length;
          const aktiv = opcija.value === aktivan;
          return (
            <button
              key={opcija.value}
              type="button"
              role="tab"
              aria-selected={aktiv}
              title={opcija.title}
              onClick={() => onPromjena(opcija.value)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors sm:text-xs"
              style={{
                backgroundColor: aktiv ? 'rgb(var(--first-primary-rgb) / 0.08)' : 'transparent',
                color: aktiv ? 'var(--first-primary)' : 'var(--first-nonary)',
                border: aktiv ? '1px solid rgb(var(--first-primary-rgb) / 0.28)' : '1px solid transparent',
              }}
            >
              {opcija.label}
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums"
                style={{
                  backgroundColor: aktiv
                    ? 'rgb(var(--first-primary-rgb) / 0.12)'
                    : 'rgb(var(--first-quaternary-rgb) / 0.3)',
                  color: aktiv ? 'var(--first-primary)' : 'var(--first-nonary)',
                }}
              >
                {br}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Prazno stanje ────────────────────────────────────────────────────────────

function PraznoStanje({ statusFilter, fazaFilter }: { statusFilter: string; fazaFilter: string }) {
  const statusLabel = STATUS_FILTRI.find((f) => f.value === statusFilter)?.label ?? statusFilter;
  const fazaLabel   = FAZA_FILTRI.find((f) => f.value === fazaFilter)?.label;
  const poruka =
    statusFilter === 'u_obradi' && fazaFilter !== 'sve_faze' && fazaLabel
      ? `Nema zahtjeva u statusu "${statusLabel}" s fazom "${fazaLabel}".`
      : `Nema zahtjeva za odabrani filter "${statusLabel}".`;

  return (
    <div
      className="rounded-2xl p-8 text-center shadow-card"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
        {poruka}
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
        Promijenite filter ili osvježite prikaz.
      </p>
    </div>
  );
}

// ─── Glavna komponenta ────────────────────────────────────────────────────────

export function DispecerZahtjeviLista() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const filterIzUrl = searchParams.get('filter') ?? 'svi';
  const fazaIzUrl   = searchParams.get('faza')   ?? 'sve_faze';

  const [zahtjevi,     setZahtjevi]     = useState<ZahtjevZaDispecerskuKarticu[]>([]);
  const [ucitava,      setUcitava]      = useState(true);
  const [greska,       setGreska]       = useState<string | null>(null);
  const [imeKorisnika, setImeKorisnika] = useState('Dispečer');

  const aktivniStatus = normalizujDispecerFilterIzParametra(filterIzUrl, DOZVOLJENI_STATUS_FILTRI);
  const aktivnaFaza   = DOZVOLJENE_FAZE.includes(fazaIzUrl as FazaFilter)
    ? (fazaIzUrl as FazaFilter)
    : 'sve_faze';

  const zahtjeviUObradi = useMemo(
    () => filterPoStatusu(zahtjevi, 'u_obradi'),
    [zahtjevi],
  );

  const prikazLista = useMemo(
    () => filtrirajZahtjeve(zahtjevi, aktivniStatus, aktivnaFaza),
    [zahtjevi, aktivniStatus, aktivnaFaza],
  );

  const sortirano = useMemo(() => {
    if (INBOX_REDOSLIJED_STATUSI.has(aktivniStatus as StatusFilter)) {
      return sastaviDispecerskiInboxRedoslijed(prikazLista).uredjeni;
    }
    // Završeni: najnovije završene prvo
    if (aktivniStatus === 'zavrseni') {
      return [...prikazLista].sort(
        (a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()
      );
    }
    return [...prikazLista].sort((a, b) => {
      const r = rangOperativnogPrioriteta(a.final_priority) - rangOperativnogPrioriteta(b.final_priority);
      if (r !== 0) return r;
      const t = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (t !== 0) return t;
      return a.id - b.id;
    });
  }, [prikazLista, aktivniStatus]);

  // ─── Paginacija ─────────────────────────────────────────────────────────────

  const ukupnoZahtjeva = sortirano.length;
  const ukupnoStranica = Math.max(1, Math.ceil(ukupnoZahtjeva / ZAHTJEVA_PO_STRANICI));

  const stranicaParam  = searchParams.get('page');
  const stranicaBroj   = stranicaParam ? Number.parseInt(stranicaParam, 10) : 1;
  const aktivnaStranica = Number.isFinite(stranicaBroj) && stranicaBroj >= 1
    ? Math.min(stranicaBroj, ukupnoStranica)
    : 1;

  const prikazZaOvuStranicu = useMemo(() => {
    const pocetak = (aktivnaStranica - 1) * ZAHTJEVA_PO_STRANICI;
    return sortirano.slice(pocetak, pocetak + ZAHTJEVA_PO_STRANICI);
  }, [sortirano, aktivnaStranica]);

  const qsZaStranicu = useCallback(
    (stranica: number) => {
      const p = new URLSearchParams(searchParams.toString());
      if (stranica <= 1) p.delete('page'); else p.set('page', String(stranica));
      const qs = p.toString();
      return qs ? `/dispecer/zahtjevi?${qs}` : '/dispecer/zahtjevi';
    },
    [searchParams],
  );

  useEffect(() => {
    if (ucitava || ukupnoZahtjeva === 0) return;
    if (stranicaBroj > ukupnoStranica) {
      router.replace(qsZaStranicu(aktivnaStranica), { scroll: false });
    }
  }, [ucitava, ukupnoZahtjeva, ukupnoStranica, stranicaBroj, aktivnaStranica, qsZaStranicu, router]);

  // ─── Učitavanje ─────────────────────────────────────────────────────────────

  const ucitajZahtjeve = useCallback(async (tiho = false) => {
    if (!tiho) { setUcitava(true); setGreska(null); }
    try {
      const r = await fetch('/api/dispecer/zahtjevi', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju podataka.');
      setZahtjevi(d.zahtjevi ?? []);
    } catch (err) {
      if (!tiho) setGreska(err instanceof Error ? err.message : 'Došlo je do greške.');
    } finally {
      if (!tiho) setUcitava(false);
    }
  }, []);

  useEffect(() => { void ucitajZahtjeve(false); }, [ucitajZahtjeve]);

  useEffect(() => {
    const t = setInterval(() => void ucitajZahtjeve(true), 25_000);
    return () => clearInterval(t);
  }, [ucitajZahtjeve]);

  useEffect(() => {
    const supabase = kreirajKlijenta();
    let mounted    = true;
    const ucitajIme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) return;
      const { data: profil } = await supabase.from('osoba').select('ime, prezime').eq('id_osobe', user.id).maybeSingle();
      const imeIzProfila = [profil?.ime, profil?.prezime].filter(Boolean).join(' ').trim();
      const imeIzMeta    = [user.user_metadata?.ime, user.user_metadata?.prezime].filter(Boolean).join(' ').trim();
      setImeKorisnika(imeIzProfila || imeIzMeta || user.email || 'Dispečer');
    };
    void ucitajIme();
    return () => { mounted = false; };
  }, []);

  // ─── Upravljanje filterima ───────────────────────────────────────────────────

  function promijeniStatus(noviStatus: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (!noviStatus || noviStatus === 'svi') p.delete('filter'); else p.set('filter', noviStatus);
    p.delete('faza');
    p.delete('page');
    const qs = p.toString();
    router.push(qs ? `/dispecer/zahtjevi?${qs}` : '/dispecer/zahtjevi');
  }

  function promijeniPAzu(novaFaza: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (!novaFaza || novaFaza === 'sve_faze') p.delete('faza'); else p.set('faza', novaFaza);
    p.delete('page');
    const qs = p.toString();
    router.push(qs ? `/dispecer/zahtjevi?${qs}` : '/dispecer/zahtjevi');
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppShell uloga="dispecer" imeKorisnika={imeKorisnika}>
      <div className="mx-auto w-full max-w-6xl sm:px-0">
        {/* Zaglavlje */}
        <div className="mb-6">
          <Link
            href="/dispecer"
            className="mb-4 inline-flex items-center gap-1 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Nazad na kontrolnu ploču
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
                Pregled zahtjeva
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
                Status i faza obrade svakog zahtjeva prikazani su odvojeno.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => void ucitajZahtjeve(false)}
              isLoading={ucitava}
              loadingText="Osvježavanje..."
            >
              <RefreshCw className="h-4 w-4" />
              Osvježi
            </Button>
          </div>
        </div>

        {greska && (
          <div className="mb-6">
            <AlertMessage variant="error" message={greska} />
          </div>
        )}

        {ucitava && (
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
            Učitavanje zahtjeva...
          </p>
        )}

        {!ucitava && (
          <div className="mb-5 space-y-0 overflow-x-auto">
            {/* Primarni filter - status */}
            <StatusFilterTraka
              aktivan={aktivniStatus}
              zahtjevi={zahtjevi}
              onPromjena={promijeniStatus}
            />

            {/* Sekundarni filter - faza (samo za "U obradi") */}
            {aktivniStatus === 'u_obradi' && (
              <FazaFilterTraka
                aktivan={aktivnaFaza}
                zahtjeviUObradi={zahtjeviUObradi}
                onPromjena={promijeniPAzu}
              />
            )}
          </div>
        )}

        {!ucitava && sortirano.length === 0 && (
          <PraznoStanje statusFilter={aktivniStatus} fazaFilter={aktivnaFaza} />
        )}

        {!ucitava && sortirano.length > 0 && (
          <>
            <ul
              className="grid min-w-0 gap-5
                [grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),22rem))]"
              aria-label={`Zahtjevi, stranica ${aktivnaStranica} od ${ukupnoStranica}`}
            >
              {prikazZaOvuStranicu.map((z) => (
                <li key={z.id} className="min-w-0 w-full">
                  <DispecerskaZahtjevPregledGridKartica zahtjev={z} />
                </li>
              ))}
            </ul>

            {ukupnoStranica > 1 && (
              <nav
                className="mt-8 flex min-w-0 flex-col items-stretch justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}
                aria-label="Paginacija liste zahtjeva"
              >
                <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                  Prikazano{' '}
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                    {(aktivnaStranica - 1) * ZAHTJEVA_PO_STRANICI + 1}
                    -
                    {Math.min(aktivnaStranica * ZAHTJEVA_PO_STRANICI, ukupnoZahtjeva)}
                  </span>{' '}
                  od{' '}
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--first-octonary)' }}>
                    {ukupnoZahtjeva}
                  </span>
                  <span className="hidden sm:inline">
                    {' '}· stranica{' '}
                    <span className="tabular-nums">{aktivnaStranica}</span> /{' '}
                    <span className="tabular-nums">{ukupnoStranica}</span>
                  </span>
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={qsZaStranicu(aktivnaStranica - 1)}
                    scroll
                    aria-disabled={aktivnaStranica <= 1}
                    className={[
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                      aktivnaStranica <= 1 ? 'pointer-events-none opacity-45' : 'hover:bg-black/[0.03]',
                    ].join(' ')}
                    style={{
                      borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
                      color: 'var(--first-octonary)',
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Prethodna
                  </Link>
                  <Link
                    href={qsZaStranicu(aktivnaStranica + 1)}
                    scroll
                    aria-disabled={aktivnaStranica >= ukupnoStranica}
                    className={[
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                      aktivnaStranica >= ukupnoStranica ? 'pointer-events-none opacity-45' : 'hover:bg-black/[0.03]',
                    ].join(' ')}
                    style={{
                      borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
                      color: 'var(--first-octonary)',
                    }}
                  >
                    Naredna
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
