'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Truck,
  ClipboardList,
  ChevronRight,
  MapPin,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { MiniKalendar } from '@/components/serviser/MiniKalendar';
import { StatusBadge } from '@/components/servisirane/ZahtjevKartica';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { kreirajKlijenta } from '@/lib/supabase/klijent';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';

// ─── Tipovi ───────────────────────────────────────────────────────────────────

interface IntervencijaZaListu extends ServisniZahtjev {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
}

type KpiFilter =
  | 'sve'
  | 'dodijeljeno'
  | 'u_radu'
  | 'u_izvrsenju'
  | 'zavrseno'
  | 'danas'
  | 'hitno';

// ─── Helperi ──────────────────────────────────────────────────────────────────

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function jeIntervencijaZaDanas(z: IntervencijaZaListu): boolean {
  if (!z.termin_planirani_pocetak) return false;
  const t = new Date(z.termin_planirani_pocetak);
  const d = new Date();
  return (
    t.getFullYear() === d.getFullYear() &&
    t.getMonth() === d.getMonth() &&
    t.getDate() === d.getDate()
  );
}

function jeHitna(z: IntervencijaZaListu): boolean {
  return (z.urgency_score ?? 0) >= 75 || Boolean(z.is_premium);
}

function filtrirajPoKpi(
  intervencije: IntervencijaZaListu[],
  filter: KpiFilter,
  selectedDatum: string | null,
): IntervencijaZaListu[] {
  if (selectedDatum) {
    return intervencije.filter((z) => {
      if (!z.termin_planirani_pocetak) return false;
      return dateToStr(new Date(z.termin_planirani_pocetak)) === selectedDatum;
    });
  }
  switch (filter) {
    case 'dodijeljeno':
      return intervencije.filter((z) => z.status === 'dodijeljeno');
    case 'u_radu':
      return intervencije.filter((z) => z.status === 'u_radu');
    case 'u_izvrsenju':
      return intervencije.filter((z) => z.status === 'u_izvrsenju');
    case 'zavrseno':
      return intervencije.filter((z) => z.status === 'zavrseno');
    case 'danas':
      return intervencije.filter(jeIntervencijaZaDanas);
    case 'hitno':
      return intervencije.filter(jeHitna);
    default:
      return intervencije.filter((z) =>
        ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(z.status),
      );
  }
}

// ─── Kartica intervencije ─────────────────────────────────────────────────────

function IntervencijaKartica({ z }: { z: IntervencijaZaListu }) {
  const kat = labelKategorije(z);
  const naslov = kat.podkategorija
    ? `${kat.glavna} - ${kat.podkategorija}`
    : kat.glavna;
  const hitno = jeHitna(z);
  const termin = z.termin_planirani_pocetak
    ? new Date(z.termin_planirani_pocetak).toLocaleString('bs-BA', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <li>
      <Link
        href={`/serviser/intervencije/${z.id}`}
        className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-black/[0.02]"
      >
        <div className="mt-0.5 flex-shrink-0">
          {hitno ? (
            <AlertTriangle
              className="h-4 w-4"
              style={{ color: 'var(--first-senary)' }}
            />
          ) : (
            <ClipboardList
              className="h-4 w-4"
              style={{ color: 'var(--first-quinary)' }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="font-medium"
              style={{ color: 'var(--first-octonary)' }}
            >
              {naslov}
            </p>
            <StatusBadge status={z.status} />
            {z.is_premium && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.12)',
                  color: '#B91C1C',
                  border: '1px solid rgba(220,38,38,0.25)',
                }}
              >
                Premium
              </span>
            )}
          </div>
          <div
            className="mt-1 flex flex-wrap gap-x-4 text-xs"
            style={{ color: 'var(--first-nonary)' }}
          >
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {z.address.length > 40
                ? `${z.address.substring(0, 40)}...`
                : z.address}
            </span>
            {termin && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {termin}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 flex-shrink-0"
          style={{ color: 'var(--first-quinary)' }}
        />
      </Link>
    </li>
  );
}

// ─── KPI kartica ──────────────────────────────────────────────────────────────

function KpiKartica({
  oznaka,
  vrijednost,
  boja,
  Ikona,
  aktivan,
  onClick,
}: {
  oznaka: string;
  vrijednost: number;
  boja: string;
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  aktivan: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: aktivan
          ? `color-mix(in srgb, ${boja} 14%, white)`
          : 'rgb(var(--first-quinary-rgb) / 0.22)',
        border: aktivan
          ? `2px solid color-mix(in srgb, ${boja} 45%, transparent)`
          : '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        boxShadow: aktivan
          ? `0 0 0 1px color-mix(in srgb, ${boja} 20%, transparent)`
          : 'none',
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${boja} 14%, transparent)`,
        }}
      >
        <Ikona className="h-5 w-5" style={{ color: boja }} />
      </div>
      <div>
        <p
          className="text-2xl font-bold tabular-nums leading-none"
          style={{ color: aktivan ? boja : 'var(--first-octonary)' }}
        >
          {vrijednost}
        </p>
        <p
          className="mt-0.5 text-xs font-medium leading-tight"
          style={{ color: 'var(--first-nonary)' }}
        >
          {oznaka}
        </p>
      </div>
    </button>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function ServiserPage() {
  const [intervencije, setIntervencije] = useState<IntervencijaZaListu[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [imeKorisnika, setImeKorisnika] = useState('Korisnik');
  const [aktivniKpi, setAktivniKpi] = useState<KpiFilter>('sve');
  const [selectedDatum, setSelectedDatum] = useState<string | null>(null);

  async function ucitaj() {
    setUcitava(true);
    setGreska(null);
    try {
      const r = await fetch('/api/serviser/intervencije', {
        cache: 'no-store',
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      setIntervencije(d.intervencije ?? []);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju.');
    } finally {
      setUcitava(false);
    }
  }

  useEffect(() => {
    ucitaj();
  }, []);

  useEffect(() => {
    const supabase = kreirajKlijenta();
    let mounted = true;
    const ucitajIme = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted || !user) return;
      const { data: profil } = await supabase
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', user.id)
        .maybeSingle();
      const imeIzProfila = [profil?.ime, profil?.prezime]
        .filter(Boolean)
        .join(' ')
        .trim();
      const imeIzMeta = [user.user_metadata?.ime, user.user_metadata?.prezime]
        .filter(Boolean)
        .join(' ')
        .trim();
      setImeKorisnika(imeIzProfila || imeIzMeta || user.email || 'Korisnik');
    };
    void ucitajIme();
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Izračuni ─────────────────────────────────────────────────────────

  const imeZaPozdrav = imeKorisnika.split(' ')[0]?.trim() || imeKorisnika;

  const dodijeljeno = useMemo(
    () => intervencije.filter((z) => z.status === 'dodijeljeno').length,
    [intervencije],
  );
  const uRadu = useMemo(
    () => intervencije.filter((z) => z.status === 'u_radu').length,
    [intervencije],
  );
  const naTermenu = useMemo(
    () => intervencije.filter((z) => z.status === 'u_izvrsenju').length,
    [intervencije],
  );
  const zavrseno = useMemo(
    () => intervencije.filter((z) => z.status === 'zavrseno').length,
    [intervencije],
  );
  const danas = useMemo(
    () => intervencije.filter(jeIntervencijaZaDanas).length,
    [intervencije],
  );
  const hitno = useMemo(
    () => intervencije.filter(jeHitna).length,
    [intervencije],
  );

  const filtriran = useMemo(
    () => filtrirajPoKpi(intervencije, aktivniKpi, selectedDatum),
    [intervencije, aktivniKpi, selectedDatum],
  );

  const sortirano = useMemo(
    () =>
      [...filtriran].sort((a, b) => {
        if (Boolean(a.is_premium) !== Boolean(b.is_premium))
          return a.is_premium ? -1 : 1;
        return (b.urgency_score ?? 0) - (a.urgency_score ?? 0);
      }),
    [filtriran],
  );

  // ─── Kpi definicije ───────────────────────────────────────────────────

  const kpiKartice = [
    {
      key: 'danas' as KpiFilter,
      oznaka: 'Danas',
      v: danas,
      boja: 'var(--first-primary)',
      Ikona: Calendar,
    },
    {
      key: 'dodijeljeno' as KpiFilter,
      oznaka: 'Dodijeljeno',
      v: dodijeljeno,
      boja: '#D97706',
      Ikona: Clock,
    },
    {
      key: 'u_radu' as KpiFilter,
      oznaka: 'Prihvaćeno',
      v: uRadu,
      boja: 'var(--first-secondary)',
      Ikona: ClipboardList,
    },
    {
      key: 'u_izvrsenju' as KpiFilter,
      oznaka: 'Na terenu',
      v: naTermenu,
      boja: 'var(--first-secondary)',
      Ikona: Truck,
    },
    {
      key: 'zavrseno' as KpiFilter,
      oznaka: 'Završeno',
      v: zavrseno,
      boja: 'var(--first-nonary)',
      Ikona: CheckCircle2,
    },
    {
      key: 'hitno' as KpiFilter,
      oznaka: 'Hitno',
      v: hitno,
      boja: '#DC2626',
      Ikona: Zap,
    },
  ];

  const aktivniKpiUkupno = sortirano.length;
  const aktivniFilter =
    aktivniKpi === 'sve' ? null : kpiKartice.find((k) => k.key === aktivniKpi);

  // Label za zaglavlje liste
  function listaNaslov(): string {
    if (selectedDatum) {
      return new Date(`${selectedDatum}T12:00:00`).toLocaleDateString('bs-BA', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
    }
    if (aktivniFilter) return aktivniFilter.oznaka;
    return 'Aktivni zadaci';
  }

  function resetFilteri() {
    setSelectedDatum(null);
    setAktivniKpi('sve');
  }

  return (
    <AppShell uloga="serviser" imeKorisnika={imeKorisnika}>
      {/* Zaglavlje */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--first-octonary)' }}
          >
            Dobro jutro, {imeZaPozdrav}!
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            {formatirajDatumPrikaz(new Date())}
            {dodijeljeno + uRadu + naTermenu > 0 && (
              <>
                {' '}
                -{' '}
                <span
                  className="font-medium"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {dodijeljeno + uRadu + naTermenu === 1
                    ? '1 aktivni zadatak'
                    : dodijeljeno + uRadu + naTermenu < 5
                      ? `${dodijeljeno + uRadu + naTermenu} aktivna zadatka`
                      : `${dodijeljeno + uRadu + naTermenu} aktivnih zadataka`}
                </span>
              </>
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={ucitaj}
          isLoading={ucitava}
          loadingText="Osvježavanje..."
        >
          <RefreshCw className="h-4 w-4" />
          Osvježi
        </Button>
      </div>

      {greska && (
        <div className="mb-4">
          <AlertMessage variant="error" message={greska} />
        </div>
      )}

      {/* ─── Dvostupčani layout ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Lijevi stupac: KPI + lista ─────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* KPI kartice */}
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {kpiKartice.map(({ key, oznaka, v, boja, Ikona }) => (
              <KpiKartica
                key={key}
                oznaka={oznaka}
                vrijednost={v}
                boja={boja}
                Ikona={Ikona}
                aktivan={aktivniKpi === key && !selectedDatum}
                onClick={() => {
                  setSelectedDatum(null);
                  setAktivniKpi(aktivniKpi === key ? 'sve' : key);
                }}
              />
            ))}
          </div>

          {/* Lista intervencija */}
          <div
            className="rounded-2xl shadow-card"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom:
                  '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <h2
                  className="font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {listaNaslov()}
                </h2>
                {!ucitava && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
                    style={{
                      backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.3)',
                      color: 'var(--first-nonary)',
                    }}
                  >
                    {aktivniKpiUkupno}
                  </span>
                )}
                {(aktivniFilter || selectedDatum) && (
                  <button
                    type="button"
                    onClick={resetFilteri}
                    className="ml-1 text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    × Ukloni filter
                  </button>
                )}
              </div>
              <Link
                href="/serviser/intervencije"
                className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--first-secondary)' }}
              >
                Sve intervencije <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <ul
              className="divide-y"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}
            >
              {ucitava && (
                <li
                  className="px-5 py-8 text-center text-sm"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Učitavanje...
                </li>
              )}
              {!ucitava && sortirano.length === 0 && (
                <li className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <CheckCircle2
                    className="h-8 w-8"
                    style={{ color: 'var(--first-quinary)' }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {selectedDatum
                      ? 'Nema intervencija za odabrani datum.'
                      : aktivniFilter
                        ? `Nema intervencija za filter "${aktivniFilter.oznaka}".`
                        : 'Nemate aktivnih zadataka. Odlično!'}
                  </p>
                  {(aktivniFilter || selectedDatum) && (
                    <button
                      type="button"
                      onClick={resetFilteri}
                      className="mt-1 text-sm transition-opacity hover:opacity-70"
                      style={{ color: 'var(--first-secondary)' }}
                    >
                      Prikaži sve zadatke
                    </button>
                  )}
                </li>
              )}
              {!ucitava &&
                sortirano.map((z) => <IntervencijaKartica key={z.id} z={z} />)}
            </ul>
          </div>
        </div>

        {/* ── Desni stupac: Kalendar zauzetosti (sticky) ─────────────────── */}
        <div className="lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-4">
          <MiniKalendar
            intervencije={intervencije}
            selectedDate={selectedDatum}
            onSelectDate={(date) => {
              setSelectedDatum(date);
              if (date) setAktivniKpi('sve');
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
