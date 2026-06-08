'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlertMessage } from '@/components/ui/AlertMessage';
import {
  AddressAutocomplete,
  TileMap,
  reverseGeocode,
  type NominatimResult,
} from '@/components/shared/MapaOdabir';

// ─── Korak 2: Lokacija ────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 43.8563, lon: 18.4131 };
const DEFAULT_ZOOM = 13;

/** Zajednička geometrija sekundarnih akcija (ne konkurišu primarnom „Dalje”). */
const STIL_DUGME_SEKUNDARNO_BAZA =
  'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border px-4 text-sm font-medium ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 shadow-none';

/** GPS: plava familija (--first-secondary, --first-quaternary). */
const STIL_DUGME_GPS = [
  STIL_DUGME_SEKUNDARNO_BAZA,
  'border-[rgb(var(--first-secondary-rgb)/0.55)] bg-[rgb(var(--first-quaternary-rgb)/0.42)] text-[var(--first-secondary)]',
  'hover:bg-[rgb(var(--first-secondary-rgb)/0.12)] hover:border-[rgb(var(--first-secondary-rgb)/0.72)]',
].join(' ');

/** Mapa: akcent zlatno-narančasta (--surface-info, --border-info, --first-septenary). */
const STIL_DUGME_MAPA = [
  STIL_DUGME_SEKUNDARNO_BAZA,
  'border-[var(--border-info)] bg-[var(--surface-info)] text-[var(--first-octonary)]',
  'hover:bg-[rgb(var(--first-septenary-rgb)/0.24)] hover:border-[rgb(var(--first-septenary-rgb)/0.45)]',
].join(' ');

export interface KorakLokacijaProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  isLocating: boolean;
  locationError: string | null;
  locationSuccessMessage: string | null;
  isMapVisible: boolean;
  onUpdate: (p: {
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    isLocating?: boolean;
    locationError?: string | null;
    locationSuccessMessage?: string | null;
    hasSelectedMapLocation?: boolean;
    isMapVisible?: boolean;
  }) => void;
  error?: string;
}

export function KorakLokacija({
  address,
  latitude,
  longitude,
  isLocating,
  locationError,
  locationSuccessMessage,
  isMapVisible,
  onUpdate,
  error,
}: KorakLokacijaProps) {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapHeight, setMapHeight] = useState(300);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    function sync() {
      setMapHeight(mq.matches ? 220 : 300);
    }
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const pin =
    latitude != null && longitude != null
      ? { lat: latitude, lon: longitude }
      : null;

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMapCenter({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  async function handlePin(coords: { lat: number; lon: number }) {
    setMapCenter(coords);
    const adresa = await reverseGeocode(coords.lat, coords.lon);
    onUpdate({
      latitude: coords.lat,
      longitude: coords.lon,
      hasSelectedMapLocation: true,
      locationError: null,
      locationSuccessMessage: 'Lokacija je označena na mapi.',
      ...(adresa ? { address: adresa } : {}),
    });
  }

  function handleAutocompleteSelect(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    onUpdate({
      address: r.display_name,
      latitude: lat,
      longitude: lon,
      hasSelectedMapLocation: true,
      locationError: null,
      locationSuccessMessage: null,
    });
    setMapCenter({ lat, lon });
    setZoom(15);
  }

  const gpsNedostupanPoruka = 'Lokacija nije dostupna. Unesite adresu ručno.';
  const gpsNijeHTTPSPoruka =
    'Lokacija u pregledniku radi samo preko HTTPS (ili na localhostu). Otvorite stranicu preko sigurne veze ili unesite adresu ručno.';

  function porukaGpsGreske(err: GeolocationPositionError): string {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Pristup lokaciji je odbijen ili blokiran. U postavkama preglednika dozvolite lokaciju za ovu stranicu, zatim pokušajte ponovo. Možete i unijeti adresu ručno.';
      case err.POSITION_UNAVAILABLE:
        return 'Uređaj trenutno ne može odrediti lokaciju (npr. isključen GPS). Unesite adresu ručno ili pokušajte na otvorenom mjestu.';
      case err.TIMEOUT:
        return 'Lociranje je predugo trajalo. Pokušajte ponovo ili unesite adresu ručno.';
      default:
        return gpsNedostupanPoruka;
    }
  }

  function locirajMe() {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      onUpdate({
        locationError: gpsNijeHTTPSPoruka,
        isLocating: false,
        locationSuccessMessage: null,
      });
      return;
    }
    if (!('geolocation' in navigator)) {
      onUpdate({
        locationError: gpsNedostupanPoruka,
        isLocating: false,
        locationSuccessMessage: null,
      });
      return;
    }

    onUpdate({
      isLocating: true,
      locationError: null,
      locationSuccessMessage: null,
    });

    /* enableHighAccuracy: false brže uspijeva na Wi‑Fi / laptopu; maximumAge dopušta nedavno keširanu poziciju. */
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setMapCenter({ lat, lon });
        setZoom(15);
        const adresa = await reverseGeocode(lat, lon);
        onUpdate({
          latitude: lat,
          longitude: lon,
          hasSelectedMapLocation: true,
          isLocating: false,
          locationError: null,
          locationSuccessMessage: adresa
            ? 'Lokacija je pronađena. Provjerite adresu prije nastavka.'
            : 'Lokacija je određena (koordinate će biti sačuvane uz zahtjev). Unesite adresu intervencije u polje iznad - obavezna je prije nastavka.',
          ...(adresa ? { address: adresa } : {}),
        });
      },
      (err) => {
        onUpdate({
          isLocating: false,
          locationError: porukaGpsGreske(err),
          locationSuccessMessage: null,
        });
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 120_000 },
    );
  }

  function ukloniPin() {
    onUpdate({
      latitude: null,
      longitude: null,
      hasSelectedMapLocation: false,
      locationSuccessMessage: null,
    });
  }

  const gpsDisabledPoruka = isLocating
    ? 'Lociranje…'
    : 'Koristi moju trenutnu lokaciju';

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <h2
          className="text-xl font-bold"
          style={{ color: 'var(--first-octonary)' }}
        >
          Lokacija intervencije
        </h2>
        <p
          className="text-sm leading-snug"
          style={{ color: 'var(--first-nonary)' }}
        >
          Unesite adresu i označite tačnu lokaciju na mapi. Koordinate su
          obavezne kako bi serviser mogao dobiti navigaciju do mjesta
          intervencije.
        </p>
      </div>

      <AddressAutocomplete
        value={address}
        onChange={(val) => {
          onUpdate({ address: val });
        }}
        onSelect={handleAutocompleteSelect}
        error={error}
        label="Adresa intervencije *"
        helperText="Provjerite da li je adresa tačna. Po potrebi je možete ručno izmijeniti."
        inputId="wizard-adresa"
        placeholder="Unesite adresu intervencije…"
      />

      <div className="relative z-30 flex gap-3">
        <button
          type="button"
          onClick={locirajMe}
          disabled={isLocating}
          className={STIL_DUGME_GPS}
        >
          <Navigation
            className="h-4 w-4 shrink-0 text-[var(--first-secondary)]"
            aria-hidden
          />
          {gpsDisabledPoruka}
        </button>
      </div>

      {locationError && (
        <AlertMessage variant="warning" message={locationError} />
      )}
      {locationSuccessMessage && (
        <AlertMessage variant="success" message={locationSuccessMessage} />
      )}

      {/* Status lokacije — vizuelni indikator obaveznosti */}
      <div
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
        style={
          pin
            ? {
                backgroundColor: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.3)',
              }
            : {
                backgroundColor: 'rgba(217,119,6,0.06)',
                border: '1px solid rgba(217,119,6,0.25)',
              }
        }
      >
        {pin ? (
          <CheckCircle2
            className="h-4 w-4 flex-shrink-0"
            style={{ color: '#16A34A' }}
          />
        ) : (
          <AlertCircle
            className="h-4 w-4 flex-shrink-0"
            style={{ color: '#B45309' }}
          />
        )}
        <p
          className="text-xs font-semibold"
          style={{ color: pin ? '#15803D' : '#92400E' }}
        >
          {pin
            ? `Lokacija označena (${pin.lat.toFixed(5)}, ${pin.lon.toFixed(5)})`
            : 'Lokacija nije označena — odaberite adresu iz liste, koristite GPS ili kliknite na mapu *'}
        </p>
        {pin && (
          <button
            type="button"
            onClick={ukloniPin}
            className="ml-auto inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-50"
            style={{ color: '#DC2626' }}
            aria-label="Ukloni označenu lokaciju"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isMapVisible && (
        <div
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            borderColor: pin ? 'rgba(34,197,94,0.3)' : 'var(--border-info)',
            backgroundColor: pin
              ? 'rgba(34,197,94,0.04)'
              : 'rgb(var(--first-septenary-rgb) / 0.08)',
          }}
        >
          <div className="min-w-0 space-y-0.5">
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Mapa — označite tačnu lokaciju *
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--first-nonary)' }}
            >
              Kliknite na mapu da postavite pin. Koordinate su obavezne za
              prikaz rute serviseru.
            </p>
          </div>

          <TileMap
            center={mapCenter}
            pin={pin}
            zoom={zoom}
            height={mapHeight}
            onPin={handlePin}
            onCenter={setMapCenter}
            onZoom={setZoom}
            idleCenterHint={null}
            pinnedCenterHint={null}
          />
        </div>
      )}
    </div>
  );
}
