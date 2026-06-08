'use client';

// Dijeljeni primitivci za odabir lokacije (pretraga adrese + interaktivna OSM mapa
// + GPS). Izdvojeno iz `components/wizard/KorakLokacija.tsx` kako bi se isti
// ljudski odabir lokacije (adresa → koordinate) mogao koristiti i za baznu
// lokaciju servisera (US-48) bez ručnog unosa latitude/longitude.

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, X, Plus, Minus } from 'lucide-react';
import { AlertMessage } from '@/components/ui/AlertMessage';

// ─── Tile map matematika ──────────────────────────────────────────────────────

const TILE_SIZE = 256;

function latLonToTileFloat(lat: number, lon: number, z: number) {
  const n = Math.pow(2, z);
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function pixelToLatLon(
  px: number,
  py: number,
  midX: number,
  midY: number,
  centerTile: { x: number; y: number },
  z: number,
) {
  const n = Math.pow(2, z);
  const tx = centerTile.x + (px - midX) / TILE_SIZE;
  const ty = centerTile.y + (py - midY) / TILE_SIZE;
  const lon = (tx / n) * 360 - 180;
  const lat =
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI;
  return { lat, lon };
}

// ─── Geocoding Nominatim ──────────────────────────────────────────────────────

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export async function geocodeAdresa(
  adresa: string,
): Promise<NominatimResult[]> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresa)}&format=json&limit=5&countrycodes=ba,hr,rs,si`,
      { headers: { Accept: 'application/json' } },
    );
    return r.ok ? await r.json() : [];
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { Accept: 'application/json' } },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.display_name ?? null;
  } catch {
    return null;
  }
}

// ─── Interaktivna tile mapa ───────────────────────────────────────────────────

interface TileMapProps {
  center: { lat: number; lon: number };
  pin: { lat: number; lon: number } | null;
  zoom: number;
  height: number;
  onPin: (c: { lat: number; lon: number }) => void;
  onCenter: (c: { lat: number; lon: number }) => void;
  onZoom: (z: number) => void;
  idleCenterHint?: string | null;
  pinnedCenterHint?: string | null;
}

export function TileMap({
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
  const [w, setW] = useState(600);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startLat: number;
    startLon: number;
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

  const midX = w / 2;
  const midY = height / 2;
  const centerTile = latLonToTileFloat(center.lat, center.lon, zoom);
  const n = Math.pow(2, zoom);
  const countX = Math.ceil(w / TILE_SIZE) + 2;
  const countY = Math.ceil(height / TILE_SIZE) + 2;
  const baseX = Math.floor(centerTile.x) - Math.floor(countX / 2);
  const baseY = Math.floor(centerTile.y) - Math.floor(countY / 2);

  const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let dx = 0; dx <= countX; dx++) {
    for (let dy = 0; dy <= countY; dy++) {
      const tx = baseX + dx;
      const ty = baseY + dy;
      tiles.push({
        tx,
        ty,
        left: (tx - centerTile.x) * TILE_SIZE + midX,
        top: (ty - centerTile.y) * TILE_SIZE + midY,
      });
    }
  }

  let pinLeft: number | null = null;
  let pinTop: number | null = null;
  if (pin) {
    const pt = latLonToTileFloat(pin.lat, pin.lon, zoom);
    pinLeft = (pt.x - centerTile.x) * TILE_SIZE + midX;
    pinTop = (pt.y - centerTile.y) * TILE_SIZE + midY;
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragRef.current?.moved) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const coords = pixelToLatLon(
      e.clientX - rect.left,
      e.clientY - rect.top,
      midX,
      midY,
      centerTile,
      zoom,
    );
    onPin(coords);
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLat: center.lat,
      startLon: center.lon,
      moved: false,
    };
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      if (!dragRef.current.moved) return;
      const st = latLonToTileFloat(
        dragRef.current.startLat,
        dragRef.current.startLon,
        zoom,
      );
      const tx = st.x - dx / TILE_SIZE;
      const ty = st.y - dy / TILE_SIZE;
      onCenter({
        lon: (tx / n) * 360 - 180,
        lat:
          (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI,
      });
    },
    [zoom, n, onCenter],
  );

  function handleMouseUp() {
    dragRef.current = null;
  }

  const pinCaption =
    pinnedCenterHint === undefined
      ? 'Lokacija je označena na mapi.'
      : pinnedCenterHint;
  const mapOverlayText = pin ? (pinCaption ?? '') : (idleCenterHint ?? '');
  const prikaziCentralniHint = pin
    ? pinCaption != null && pinCaption.length > 0
    : Boolean(idleCenterHint);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{
        height,
        cursor: 'crosshair',
        userSelect: 'none',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
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
              left: Math.round(left),
              top: Math.round(top),
              width: TILE_SIZE,
              height: TILE_SIZE,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {pin && pinLeft !== null && pinTop !== null && (
        <div
          style={{
            position: 'absolute',
            left: Math.round(pinLeft) - 14,
            top: Math.round(pinTop!) - 32,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
          }}
        >
          <MapPin className="h-8 w-8" style={{ color: '#DC2626' }} />
        </div>
      )}

      {prikaziCentralniHint && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-[min(90%,20rem)] -translate-x-1/2 -translate-y-1/2
            rounded-xl px-4 py-2 text-center text-xs font-medium shadow-card"
          style={{
            backgroundColor: 'rgba(255,255,255,0.94)',
            color: '#1f2a30',
          }}
        >
          <MapPin
            className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom"
            style={{ color: '#DC2626' }}
          />
          {mapOverlayText}
        </div>
      )}

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {(
          [
            { Icon: Plus, action: () => onZoom(Math.min(zoom + 1, 18)) },
            { Icon: Minus, action: () => onZoom(Math.max(zoom - 1, 3)) },
          ] as const
        ).map(({ Icon, action }, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg shadow-card
              transition-colors hover:bg-soft-beige/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              color: '#1f2a30',
            }}
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

// ─── Autocomplete adrese ─────────────────────────────────────────────────────

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (result: NominatimResult) => void;
  error?: string;
  label?: string;
  helperText?: string;
  inputId?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  label = 'Adresa *',
  helperText,
  inputId = 'adresa-autocomplete',
  placeholder = 'Unesite adresu…',
}: AutocompleteProps) {
  const [sugestije, setSugestije] = useState<NominatimResult[]>([]);
  const [otvoreno, setOtvoreno] = useState(false);
  const [aktivan, setAktivan] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
    if (val.trim().length < 3) {
      setSugestije([]);
      setOtvoreno(false);
      return;
    }
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
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAktivan((a) => Math.min(a + 1, sugestije.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAktivan((a) => Math.max(a - 1, 0));
    }
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
      <label
        htmlFor={inputId}
        className="text-sm font-medium"
        style={{ color: 'var(--first-octonary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <textarea
          id={inputId}
          placeholder={placeholder}
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
            borderColor: error
              ? 'var(--first-senary)'
              : 'rgb(var(--first-quaternary-rgb) / 0.4)',
            backgroundColor: 'rgb(255 255 255 / 0.95)',
            color: 'var(--first-octonary)',
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
                onClick={() => {
                  onSelect(s);
                  setOtvoreno(false);
                }}
                className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-soft-beige/50"
                style={{
                  backgroundColor:
                    i === aktivan
                      ? 'rgb(var(--first-quaternary-rgb) / 0.28)'
                      : undefined,
                }}
              >
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                  style={{ color: '#DC2626' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--first-octonary)' }}
                >
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
      {error && (
        <p className="text-xs" style={{ color: 'var(--first-senary)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Visokonivovska komponenta: OdabirLokacije ─────────────────────────────────

const DEFAULT_CENTER = { lat: 43.8563, lon: 18.4131 };
const DEFAULT_ZOOM = 13;

export interface OdabirLokacijeProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (c: {
    latitude: number | null;
    longitude: number | null;
    adresa?: string;
  }) => void;
  label?: string;
  helperText?: string;
  /** GPS „moja lokacija" — sakriti kad neko postavlja TUĐU lokaciju (npr. admin za servisera). */
  prikaziGps?: boolean;
}

/**
 * Ljudski odabir lokacije: pretraga adrese (geocoding → koordinate), opciono GPS
 * i klik na mapu. Korisnik ne unosi sirove latitude/longitude — komponenta ih
 * razriješi i vrati kroz `onChange`.
 */
export function OdabirLokacije({
  latitude,
  longitude,
  onChange,
  label = 'Adresa lokacije',
  helperText = 'Pretražite adresu i odaberite je iz liste; koordinate se postavljaju automatski.',
  prikaziGps = true,
}: OdabirLokacijeProps) {
  const [adresa, setAdresa] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapHeight, setMapHeight] = useState(260);
  const [isLocating, setIsLocating] = useState(false);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [greska, setGreska] = useState<string | null>(null);

  const pin =
    latitude != null && longitude != null
      ? { lat: latitude, lon: longitude }
      : null;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setMapHeight(mq.matches ? 200 : 260);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Inicijalno: ako već imamo koordinate, centriraj mapu i prikaži razriješenu adresu.
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMapCenter({ lat: latitude, lon: longitude });
      setZoom(15);
      reverseGeocode(latitude, longitude).then((a) => {
        if (a) setAdresa(a);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    setAdresa(r.display_name);
    setMapCenter({ lat, lon });
    setZoom(15);
    setGreska(null);
    setPoruka('Lokacija je postavljena.');
    onChange({ latitude: lat, longitude: lon, adresa: r.display_name });
  }

  async function handlePin(coords: { lat: number; lon: number }) {
    setMapCenter(coords);
    setGreska(null);
    setPoruka('Lokacija je označena na mapi.');
    const a = await reverseGeocode(coords.lat, coords.lon);
    if (a) setAdresa(a);
    onChange({
      latitude: coords.lat,
      longitude: coords.lon,
      adresa: a ?? undefined,
    });
  }

  function locirajMe() {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setGreska(
        'Lokacija u pregledniku radi samo preko HTTPS (ili na localhostu).',
      );
      return;
    }
    if (!('geolocation' in navigator)) {
      setGreska('Geolokacija nije dostupna u ovom pregledniku.');
      return;
    }
    setIsLocating(true);
    setGreska(null);
    setPoruka(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setMapCenter({ lat, lon });
        setZoom(15);
        const a = await reverseGeocode(lat, lon);
        if (a) setAdresa(a);
        setIsLocating(false);
        setPoruka('Lokacija je pronađena.');
        onChange({ latitude: lat, longitude: lon, adresa: a ?? undefined });
      },
      () => {
        setIsLocating(false);
        setGreska(
          'Nije moguće dohvatiti trenutnu lokaciju. Provjerite dozvole.',
        );
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 120_000 },
    );
  }

  function ukloni() {
    setAdresa('');
    setPoruka(null);
    setGreska(null);
    onChange({ latitude: null, longitude: null });
  }

  const sekundarnoDugme =
    'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border px-4 text-sm font-medium ' +
    'transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40';

  return (
    <div className="flex flex-col gap-3">
      <AddressAutocomplete
        value={adresa}
        onChange={setAdresa}
        onSelect={handleSelect}
        label={label}
        helperText={helperText}
        inputId="bazna-lokacija-adresa"
        placeholder="npr. Maršala Tita 1, Sarajevo"
      />

      <div
        className={`grid grid-cols-1 gap-3 ${prikaziGps ? 'sm:grid-cols-2' : ''}`}
      >
        {prikaziGps && (
          <button
            type="button"
            onClick={locirajMe}
            disabled={isLocating}
            className={`${sekundarnoDugme} border-[rgb(var(--first-secondary-rgb)/0.55)] bg-[rgb(var(--first-quaternary-rgb)/0.42)] text-[var(--first-secondary)] hover:bg-[rgb(var(--first-secondary-rgb)/0.12)]`}
          >
            <Navigation className="h-4 w-4 shrink-0" aria-hidden />
            {isLocating ? 'Lociranje…' : 'Koristi moju trenutnu lokaciju'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setMapVisible((v) => !v)}
          className={`${sekundarnoDugme} border-[var(--border-info)] bg-[var(--surface-info)] text-[var(--first-octonary)] hover:bg-[rgb(var(--first-septenary-rgb)/0.24)]`}
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {mapVisible ? 'Sakrij mapu' : 'Preciziraj na mapi'}
        </button>
      </div>

      {greska && <AlertMessage variant="warning" message={greska} />}
      {poruka && !greska && pin && (
        <p
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: '#16A34A' }}
        >
          <MapPin className="h-3.5 w-3.5" />
          {poruka}
        </p>
      )}

      {mapVisible && (
        <div
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            borderColor: 'var(--border-info)',
            backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.08)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--first-nonary)' }}
            >
              Kliknite na mapu da postavite ili pomjerite lokaciju.
            </p>
            {pin && (
              <button
                type="button"
                onClick={ukloni}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-3 text-xs font-medium transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                style={{
                  borderColor: 'rgba(220,38,38,0.35)',
                  color: '#DC2626',
                  backgroundColor: '#fff',
                }}
              >
                <X className="h-3.5 w-3.5" />
                Ukloni lokaciju
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
        </div>
      )}

      {pin && (
        <p className="text-[11px]" style={{ color: 'var(--first-nonary)' }}>
          Koordinate: {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
          {' · '}
          <button
            type="button"
            onClick={ukloni}
            className="font-semibold underline-offset-2 hover:underline focus:outline-none"
            style={{ color: '#DC2626' }}
          >
            ukloni
          </button>
        </p>
      )}
    </div>
  );
}
