'use client';

/**
 * RutaKartica — profesionalna kartica prikaza rute za servisera (US-51).
 *
 * Prikazuje:
 * - Interaktivnu dual-marker OSM mapu (bazna lokacija ↔ intervencija)
 * - Procijenjenu cestovnu udaljenost i trajanje puta
 * - Dugme za otvaranje rute u Google Maps navigaciji
 * - Fallback kada koordinate nisu dostupne
 */

import {
  Navigation,
  Home,
  MapPin,
  Clock,
  Ruler,
  AlertCircle,
} from 'lucide-react';
import { RutaMapa } from '@/components/serviser/RutaMapa';
import {
  izracunajRutu,
  formatirajUdaljenost,
  formatirajTrajanjePuta,
} from '@/lib/servisirane/geoIzracun';
import Link from 'next/link';

// ─── Interfejs ────────────────────────────────────────────────────────────────

interface RutaKarticaProps {
  baznaLat: number | null;
  baznaLng: number | null;
  intervencijaLat: number | null | undefined;
  intervencijaLng: number | null | undefined;
  adresaIntervencije?: string | null;
}

// ─── Stat blok ────────────────────────────────────────────────────────────────

function StatBlok({
  Ikona,
  oznaka,
  vrijednost,
  boja,
}: {
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  oznaka: string;
  vrijednost: string;
  boja: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 px-3 py-3">
      <div
        className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${boja}14` }}
      >
        <Ikona className="h-4 w-4" style={{ color: boja }} />
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--first-nonary)' }}
      >
        {oznaka}
      </span>
      <span
        className="text-base font-bold tabular-nums"
        style={{ color: 'var(--first-octonary)' }}
      >
        {vrijednost}
      </span>
    </div>
  );
}

// ─── Bazna lokacija nije postavljena ─────────────────────────────────────────

function NemaBazne({
  adresaIntervencije,
}: {
  adresaIntervencije?: string | null;
}) {
  const mapsUrl = adresaIntervencije
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresaIntervencije)}`
    : null;

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'rgb(255 255 255/0.85)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
      >
        <Navigation
          className="h-3.5 w-3.5"
          style={{ color: 'var(--first-nonary)' }}
        />
        <p
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--first-nonary)' }}
        >
          Navigacija
        </p>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div
          className="flex items-start gap-3 rounded-xl p-3"
          style={{
            backgroundColor: 'rgba(217,119,6,0.06)',
            border: '1px solid rgba(217,119,6,0.2)',
          }}
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            style={{ color: '#B45309' }}
          />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#92400E' }}>
              Bazna lokacija nije postavljena
            </p>
            <p
              className="mt-0.5 text-xs leading-relaxed"
              style={{ color: '#B45309' }}
            >
              Postavite baznu lokaciju u profilu kako biste dobili procjenu
              udaljenosti i rutu s dva markera na mapi.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
            >
              <Navigation className="h-4 w-4" />
              Navigiraj do lokacije
            </a>
          )}
          <Link
            href="/profil"
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all hover:opacity-80"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb)/0.35)',
              color: 'var(--first-secondary)',
            }}
          >
            <Home className="h-4 w-4" />
            Postavi baznu lokaciju
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Nema koordinata intervencije ─────────────────────────────────────────────

function NemaOdredista({
  adresaIntervencije,
}: {
  adresaIntervencije?: string | null;
}) {
  const mapsUrl = adresaIntervencije
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresaIntervencije)}`
    : null;

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'rgb(255 255 255/0.85)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
      >
        <MapPin
          className="h-3.5 w-3.5"
          style={{ color: 'var(--first-nonary)' }}
        />
        <p
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--first-nonary)' }}
        >
          Lokacija intervencije
        </p>
      </div>
      {mapsUrl ? (
        <div className="px-4 py-4">
          <p className="mb-3 text-xs" style={{ color: 'var(--first-nonary)' }}>
            Koordinate nisu poznate — navigirajte prema adresi.
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            <Navigation className="h-4 w-4" />
            Otvori adresu u Maps-u
          </a>
        </div>
      ) : (
        <p
          className="px-4 py-4 text-xs"
          style={{ color: 'var(--first-nonary)' }}
        >
          Lokacija intervencije nije dostupna.
        </p>
      )}
    </div>
  );
}

// ─── Glavna komponenta ────────────────────────────────────────────────────────

export function RutaKartica({
  baznaLat,
  baznaLng,
  intervencijaLat,
  intervencijaLng,
  adresaIntervencije,
}: RutaKarticaProps) {
  // Fallback: nema koordinata intervencije
  if (intervencijaLat == null || intervencijaLng == null) {
    return <NemaOdredista adresaIntervencije={adresaIntervencije} />;
  }

  // Fallback: serviser nije postavio baznu lokaciju
  if (baznaLat == null || baznaLng == null) {
    return <NemaBazne adresaIntervencije={adresaIntervencije} />;
  }

  const ruta = izracunajRutu(
    baznaLat,
    baznaLng,
    intervencijaLat,
    intervencijaLng,
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${baznaLat},${baznaLng}&destination=${intervencijaLat},${intervencijaLng}`;

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'rgb(255 255 255/0.9)',
        border: '1px solid rgb(var(--first-secondary-rgb)/0.3)',
      }}
    >
      {/* Zaglavlje */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
          background:
            'linear-gradient(135deg, rgb(var(--first-secondary-rgb)/0.06) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.12)' }}
          >
            <Navigation
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-secondary)' }}
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-secondary)' }}
            >
              Ruta do intervencije
            </p>
            <p
              className="text-[10px] mt-px"
              style={{ color: 'var(--first-nonary)' }}
            >
              Procjena na osnovu cestovne udaljenosti
            </p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--first-secondary)', color: '#fff' }}
        >
          <Navigation className="h-3 w-3" />
          Navigiraj
        </a>
      </div>

      {/* Interaktivna dual-marker mapa */}
      <RutaMapa
        baznaLat={baznaLat}
        baznaLng={baznaLng}
        destLat={intervencijaLat}
        destLng={intervencijaLng}
        visina={220}
      />

      {/* Legenda */}
      <div
        className="flex items-center justify-between gap-4 px-4 py-2"
        style={{
          borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.15)',
          backgroundColor: 'rgb(var(--first-quinary-rgb)/0.12)',
        }}
      >
        <div
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: 'var(--first-nonary)' }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#D97706',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          />
          Vaša baza
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: 'var(--first-nonary)' }}
        >
          <MapPin
            className="h-3 w-3 flex-shrink-0"
            style={{ color: 'var(--first-primary)' }}
          />
          Intervencija
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: 'var(--first-nonary)' }}
        >
          <svg width="18" height="6" aria-hidden>
            <line
              x1="0"
              y1="3"
              x2="18"
              y2="3"
              stroke="var(--first-secondary)"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
          </svg>
          Ruta
        </div>
      </div>

      {/* Statistike: udaljenost i trajanje */}
      <div
        className="grid grid-cols-2"
        style={{ borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.2)' }}
      >
        <StatBlok
          Ikona={Ruler}
          oznaka="Udaljenost"
          vrijednost={formatirajUdaljenost(ruta.procjenaKm)}
          boja="var(--first-secondary)"
        />
        <div
          style={{
            borderLeft: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
          }}
        >
          <StatBlok
            Ikona={Clock}
            oznaka="Trajanje"
            vrijednost={formatirajTrajanjePuta(ruta.minuteProcjena)}
            boja="#D97706"
          />
        </div>
      </div>

      {/* Footer: Google Maps dugme + napomena */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.2)' }}
      >
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--first-secondary)', color: '#fff' }}
        >
          <Navigation className="h-4 w-4" />
          Otvori rutu u Google Maps navigaciji
        </a>
        <p
          className="mt-2.5 text-center text-[10px]"
          style={{ color: 'var(--first-nonary)' }}
        >
          * Procjena na osnovu pribl. {Math.round(ruta.pravacKm * 10) / 10} km
          pravocrtne udaljenosti
        </p>
      </div>
    </div>
  );
}
