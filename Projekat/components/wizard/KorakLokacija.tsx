'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, X, Plus, Minus } from 'lucide-react';
import { AlertMessage } from '@/components/ui/AlertMessage';

// ─── Tile map matematika ──────────────────────────────────────────────────────

const TILE_SIZE = 256;

function latLonToTileFloat(lat: number, lon: number, z: number) {
  const n      = Math.pow(2, z);
  const x      = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y      = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function pixelToLatLon(
  px: number, py: number,
  midX: number, midY: number,
  centerTile: { x: number; y: number },
  z: number
) {
  const n   = Math.pow(2, z);
  const tx  = centerTile.x + (px - midX) / TILE_SIZE;
  const ty  = centerTile.y + (py - midY) / TILE_SIZE;
  const lon = (tx / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI;
  return { lat, lon };
}

// ─── Geocoding Nominatim ──────────────────────────────────────────────────────

interface NominatimResult {
  display_name: string;
  lat:          string;
  lon:          string;
}

async function geocodeAdresa(adresa: string): Promise<NominatimResult[]> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresa)}&format=json&limit=5&countrycodes=ba,hr,rs,si`,
      { headers: { Accept: 'application/json' } }
    );
    return r.ok ? await r.json() : [];
  } catch { return []; }
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { Accept: 'application/json' } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.display_name ?? null;
  } catch { return null; }
}

// ─── Interaktivna tile mapa ───────────────────────────────────────────────────

interface TileMapProps {
  center:             { lat: number; lon: number };
  pin:                { lat: number; lon: number } | null;
  zoom:               number;
  height:             number;
  onPin:              (c: { lat: number; lon: number }) => void;
  onCenter:           (c: { lat: number; lon: number }) => void;
  onZoom:             (z: number) => void;
  /** Kada je `null`, ne prikazuje se centralni tekst dok nema pina (instrukcija je izvan mape). */
  idleCenterHint?:    string | null;
  /** `undefined` = podrazumijevani tekst; `null` = sakrij banner kad postoji pin (poruka je izvan mape). */
  pinnedCenterHint?:  string | null;
}

function TileMap({
  center,
  pin,
  zoom,
  height,
  onPin,
  onCenter,
  onZoom,
  idleCenterHint,
  pinnedCenterHint,
}: TileMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW]    = useState(600);
  const dragRef      = useRef<{
    startX: number; startY: number;
    startLat: number; startLon: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      if (containerRef.current) setW(containerRef.current.offsetWidth);
    });
    obs.observe(containerRef.current);
    setW(containerRef.current.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const midX       = w / 2;
  const midY       = height / 2;
  const centerTile = latLonToTileFloat(center.lat, center.lon, zoom);
  const n          = Math.pow(2, zoom);
  const countX     = Math.ceil(w / TILE_SIZE) + 2;
  const countY     = Math.ceil(height / TILE_SIZE) + 2;
  const baseX      = Math.floor(centerTile.x) - Math.floor(countX / 2);
  const baseY      = Math.floor(centerTile.y) - Math.floor(countY / 2);

  const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let dx = 0; dx <= countX; dx++) {
    for (let dy = 0; dy <= countY; dy++) {
      const tx   = baseX + dx;
      const ty   = baseY + dy;
      tiles.push({
        tx, ty,
        left: (tx - centerTile.x) * TILE_SIZE + midX,
        top:  (ty - centerTile.y) * TILE_SIZE + midY,
      });
    }
  }

  let pinLeft: number | null = null;
  let pinTop:  number | null = null;
  if (pin) {
    const pt = latLonToTileFloat(pin.lat, pin.lon, zoom);
    pinLeft  = (pt.x - centerTile.x) * TILE_SIZE + midX;
    pinTop   = (pt.y - centerTile.y) * TILE_SIZE + midY;
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragRef.current?.moved) return;
    const rect   = containerRef.current!.getBoundingClientRect();
    const coords = pixelToLatLon(e.clientX - rect.left, e.clientY - rect.top, midX, midY, centerTile, zoom);
    onPin(coords);
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLat: center.lat, startLon: center.lon, moved: false };
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    const st  = latLonToTileFloat(dragRef.current.startLat, dragRef.current.startLon, zoom);
    const tx  = st.x - dx / TILE_SIZE;
    const ty  = st.y - dy / TILE_SIZE;
    onCenter({
      lon: (tx / n) * 360 - 180,
      lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI,
    });
  }, [zoom, n, onCenter]);

  function handleMouseUp() { dragRef.current = null; }

  const pinCaption =
    pinnedCenterHint === undefined ? 'Lokacija je označena na mapi.' : pinnedCenterHint;
  const mapOverlayText = pin ? (pinCaption ?? '') : idleCenterHint ?? '';
  const prikaziCentralniHint = pin
    ? pinCaption != null && pinCaption.length > 0
    : Boolean(idleCenterHint);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{
        height,
        cursor:          'crosshair',
        userSelect:      'none',
        border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
        backgroundColor: '#e8e0d8',
      }}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={(e) => {
        e.preventDefault();
        onZoom(e.deltaY < 0 ? Math.min(zoom + 1, 18) : Math.max(zoom - 1, 3));
      }}
    >
      {tiles.map(({ tx, ty, left, top }) => {
        if (ty < 0 || ty >= n) return null;
        const wx = ((tx % n) + n) % n;
        return (
          // Dynamic OSM tile URLs are rendered as raw images in the custom map canvas.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${tx}-${ty}-${zoom}`}
            src={`https://tile.openstreetmap.org/${zoom}/${wx}/${ty}.png`}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left:     Math.round(left),
              top:      Math.round(top),
              width:    TILE_SIZE,
              height:   TILE_SIZE,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {pin && pinLeft !== null && pinTop !== null && (
        <div
          style={{
            position:      'absolute',
            left:          Math.round(pinLeft) - 14,
            top:           Math.round(pinTop!)  - 32,
            pointerEvents: 'none',
            filter:        'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
          }}
        >
          <MapPin className="h-8 w-8" style={{ color: '#DC2626' }} />
        </div>
      )}

      {prikaziCentralniHint && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-[min(90%,20rem)] -translate-x-1/2 -translate-y-1/2
            rounded-xl px-4 py-2 text-center text-xs font-medium shadow-card"
          style={{ backgroundColor: 'rgba(255,255,255,0.94)', color: '#1f2a30' }}
        >
          <MapPin className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" style={{ color: '#DC2626' }} />
          {mapOverlayText}
        </div>
      )}

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {([
          { Icon: Plus,  action: () => onZoom(Math.min(zoom + 1, 18)) },
          { Icon: Minus, action: () => onZoom(Math.max(zoom - 1, 3)) },
        ] as const).map(({ Icon, action }, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); action(); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg shadow-card
              transition-colors hover:bg-soft-beige/80"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#1f2a30' }}
            aria-label={i === 0 ? 'Približi mapu' : 'Udalji mapu'}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <p
        className="pointer-events-none absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-xs"
        style={{ backgroundColor: 'rgba(255,255,255,0.75)', color: '#666' }}
      >
        © OpenStreetMap
      </p>
    </div>
  );
}

// ─── Autocomplete adresu ─────────────────────────────────────────────────────

interface AutocompleteProps {
  value:       string;
  onChange:    (val: string) => void;
  onSelect:    (result: NominatimResult) => void;
  error?:      string;
  label?:      string;
  helperText?: string;
}

function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  label = 'Adresa intervencije *',
  helperText,
}: AutocompleteProps) {
  const [sugestije,   setSugestije]   = useState<NominatimResult[]>([]);
  const [otvoreno,    setOtvoreno]    = useState(false);
  const [aktivan,     setAktivan]     = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout>>();
  const containerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOtvoreno(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleChange(val: string) {
    onChange(val);
    setAktivan(-1);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSugestije([]); setOtvoreno(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const rezultati = await geocodeAdresa(val);
      setIsSearching(false);
      setSugestije(rezultati);
      setOtvoreno(rezultati.length > 0);
    }, 450);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!otvoreno) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktivan((a) => Math.min(a + 1, sugestije.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setAktivan((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && aktivan >= 0) {
      e.preventDefault();
      onSelect(sugestije[aktivan]);
      setOtvoreno(false);
    }
    if (e.key === 'Escape') setOtvoreno(false);
  }

  const listaOtvorena = otvoreno && sugestije.length > 0;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1.5${listaOtvorena ? ' relative z-50' : ''}`}
    >
      <label className="text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
        {label}
      </label>
      {/* Kad je lista otvorena, cijeli blok mora biti iznad GPS/map reda (z-30) da padajući panel ne izgleda „providno“. */}
      <div className="relative">
        <textarea
          id="wizard-adresa"
          placeholder="Unesite adresu intervencije…"
          value={value}
          rows={2}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => sugestije.length > 0 && setOtvoreno(true)}
          autoComplete="off"
          className="h-[72px] max-h-[72px] min-h-[72px] w-full resize-none overflow-y-auto rounded-xl border px-3 py-2.5
            break-words [overflow-wrap:anywhere]
            text-sm leading-snug transition-all duration-200 placeholder:text-text-muted/60 focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            borderColor:     error ? 'var(--first-senary)' : 'rgb(var(--first-quaternary-rgb) / 0.4)',
            backgroundColor: 'rgb(255 255 255 / 0.95)',
            color:           'var(--first-octonary)',
          }}
        />
        {isSearching && (
          <div className="pointer-events-none absolute right-3 top-2.5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-celestial-teal border-t-transparent" />
          </div>
        )}

        {listaOtvorena && (
          <div
            className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto overflow-x-hidden rounded-xl
              border bg-white shadow-xl ring-1 ring-[rgb(var(--first-primary-rgb)/0.08)]"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
            }}
          >
            {sugestije.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onSelect(s); setOtvoreno(false); }}
                className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-soft-beige/50"
                style={{
                  backgroundColor: i === aktivan ? 'rgb(var(--first-quaternary-rgb) / 0.28)' : undefined,
                }}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: '#DC2626' }} />
                <span className="text-sm" style={{ color: 'var(--first-octonary)' }}>
                  {s.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
          {helperText}
        </p>
      )}
      {error && <p className="text-xs" style={{ color: 'var(--first-senary)' }}>{error}</p>}
    </div>
  );
}

// ─── Korak 2: Lokacija ────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 43.8563, lon: 18.4131 };
const DEFAULT_ZOOM   = 13;

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
  address:                  string;
  latitude:                 number | null;
  longitude:                number | null;
  isLocating:               boolean;
  locationError:            string | null;
  locationSuccessMessage:   string | null;
  isMapVisible:             boolean;
  onUpdate:                 (p: {
    address?:                 string;
    latitude?:                number | null;
    longitude?:               number | null;
    isLocating?:              boolean;
    locationError?:           string | null;
    locationSuccessMessage?:  string | null;
    hasSelectedMapLocation?:  boolean;
    isMapVisible?:            boolean;
  }) => void;
  error?:                   string;
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
  const [zoom,      setZoom]      = useState(DEFAULT_ZOOM);
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

  const pin = latitude != null && longitude != null ? { lat: latitude, lon: longitude } : null;

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMapCenter({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  async function handlePin(coords: { lat: number; lon: number }) {
    setMapCenter(coords);
    const adresa = await reverseGeocode(coords.lat, coords.lon);
    onUpdate({
      latitude:               coords.lat,
      longitude:              coords.lon,
      hasSelectedMapLocation: true,
      locationError:          null,
      locationSuccessMessage: 'Lokacija je označena na mapi.',
      ...(adresa ? { address: adresa } : {}),
    });
  }

  function handleAutocompleteSelect(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    onUpdate({
      address:                r.display_name,
      latitude:               lat,
      longitude:              lon,
      hasSelectedMapLocation: true,
      locationError:          null,
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
        locationError:          gpsNijeHTTPSPoruka,
        isLocating:             false,
        locationSuccessMessage: null,
      });
      return;
    }
    if (!('geolocation' in navigator)) {
      onUpdate({
        locationError:          gpsNedostupanPoruka,
        isLocating:             false,
        locationSuccessMessage: null,
      });
      return;
    }

    onUpdate({
      isLocating:             true,
      locationError:          null,
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
          latitude:               lat,
          longitude:              lon,
          hasSelectedMapLocation: true,
          isLocating:             false,
          locationError:          null,
          locationSuccessMessage: adresa
            ? 'Lokacija je pronađena. Provjerite adresu prije nastavka.'
            : 'Lokacija je određena (koordinate će biti sačuvane uz zahtjev). Unesite adresu intervencije u polje iznad - obavezna je prije nastavka.',
          ...(adresa ? { address: adresa } : {}),
        });
      },
      (err) => {
        onUpdate({
          isLocating:             false,
          locationError:          porukaGpsGreske(err),
          locationSuccessMessage: null,
        });
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 120_000 }
    );
  }

  function ukloniPin() {
    onUpdate({
      latitude:               null,
      longitude:              null,
      hasSelectedMapLocation: false,
      locationSuccessMessage: null,
    });
  }

  const gpsDisabledPoruka = isLocating ? 'Lociranje…' : 'Koristi moju trenutnu lokaciju';

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
          Lokacija intervencije
        </h2>
        <p className="text-sm leading-snug" style={{ color: 'var(--first-nonary)' }}>
          Unesite adresu intervencije. Po želji dodatno precizirajte lokaciju putem GPS-a ili mape.
        </p>
      </div>

      <AddressAutocomplete
        value={address}
        onChange={(val) => { onUpdate({ address: val }); }}
        onSelect={handleAutocompleteSelect}
        error={error}
        label="Adresa intervencije *"
        helperText="Provjerite da li je adresa tačna. Po potrebi je možete ručno izmijeniti."
      />

      <div className="relative z-30 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={locirajMe}
          disabled={isLocating}
          className={STIL_DUGME_GPS}
        >
          <Navigation className="h-4 w-4 shrink-0 text-[var(--first-secondary)]" aria-hidden />
          {gpsDisabledPoruka}
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ isMapVisible: !isMapVisible })}
          className={STIL_DUGME_MAPA}
        >
          <MapPin
            className="h-4 w-4 shrink-0 text-[rgb(var(--first-senary-rgb))]"
            aria-hidden
          />
          {isMapVisible ? 'Sakrij mapu' : 'Preciziraj lokaciju na mapi'}
        </button>
      </div>

      {locationError && (
        <AlertMessage variant="warning" message={locationError} />
      )}
      {locationSuccessMessage && (
        <AlertMessage variant="success" message={locationSuccessMessage} />
      )}

      {isMapVisible && (
        <div
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            borderColor: 'var(--border-info)',
            backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.08)',
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
                Mapa (opcionalno)
              </h3>
              <p className="text-xs leading-relaxed sm:text-sm" style={{ color: 'var(--first-nonary)' }}>
                Kliknite na mapu ako želite preciznije označiti lokaciju.
              </p>
            </div>
            {pin && (
              <button
                type="button"
                onClick={ukloniPin}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-[10px] border px-3 text-xs font-medium
                  transition-colors hover:bg-red-50"
                style={{
                  borderColor:     'rgba(220,38,38,0.35)',
                  color:           '#DC2626',
                  backgroundColor: '#fff',
                }}
              >
                <X className="h-3.5 w-3.5" />
                Ukloni pin
              </button>
            )}
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

          <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
            Adresa iz polja iznad ostaje obavezna. Koordinate sa mape služe samo kao dodatna pomoć.
          </p>
        </div>
      )}
    </div>
  );
}
