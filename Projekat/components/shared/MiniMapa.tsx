'use client';

/**
 * MiniMapa - shared read-only tile map.
 *
 * Koristi isti pristup kao KorakLokacija (custom OSM tile rendering bez
 * eksternih biblioteka). Nominatim geocodira adresu ako koordinate nisu
 * dostupne ili su neprecizne.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Plus, Minus, Navigation } from 'lucide-react';

// ─── Tile matematika (ista logika kao KorakLokacija) ─────────────────────────

const TILE_SIZE = 256;

function latLonToTileFloat(lat: number, lon: number, z: number) {
  const n = Math.pow(2, z);
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

// ─── Read-only TileMap ────────────────────────────────────────────────────────

interface TileMapViewProps {
  center: { lat: number; lon: number };
  pin: { lat: number; lon: number } | null;
  zoom: number;
  height: number;
  onCenter: (c: { lat: number; lon: number }) => void;
  onZoom: (z: number) => void;
}

function TileMapView({
  center,
  pin,
  zoom,
  height,
  onCenter,
  onZoom,
}: TileMapViewProps) {
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        height,
        cursor: 'grab',
        userSelect: 'none',
        backgroundColor: '#e8e0d8',
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
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
          }}
        >
          <MapPin
            className="h-8 w-8"
            style={{ color: 'var(--first-primary)' }}
          />
        </div>
      )}

      {/* Zoom kontrole */}
      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {[
          { label: '+', action: () => onZoom(Math.min(zoom + 1, 18)) },
          { label: '−', action: () => onZoom(Math.max(zoom - 1, 3)) },
        ].map(({ label, action }, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold shadow transition-colors hover:bg-gray-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              color: '#1f2a30',
            }}
            aria-label={i === 0 ? 'Približi' : 'Udalji'}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OSM attribution */}
      <p
        className="pointer-events-none absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[10px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.72)', color: '#555' }}
      >
        © OpenStreetMap
      </p>
    </div>
  );
}

// ─── Nominatim geocoding ──────────────────────────────────────────────────────

async function geocodeAdresa(
  adresa: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    const qs = new URLSearchParams({ q: adresa, format: 'json', limit: '1' });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${qs}`,
      {
        headers: { 'Accept-Language': 'bs,hr,sr,en' },
      },
    );
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (data[0])
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    return null;
  } catch {
    return null;
  }
}

// ─── MiniMapa (javna komponenta) ──────────────────────────────────────────────

export interface MiniMapaProps {
  adresa: string;
  lat?: number | null;
  lng?: number | null;
  /** Visina tile mape u pikselima (bez footera). @default 180 */
  visina?: number;
  /** Prikazati footer s adresom i Google Maps linkom. @default true */
  prikaziFooter?: boolean;
  /** Zaobljeni uglovi + border na cijeloj kartici. @default true */
  kartica?: boolean;
}

const DEFAULT_CENTER = { lat: 43.8563, lon: 18.4131 }; // Sarajevo

export function MiniMapa({
  adresa,
  lat,
  lng,
  visina = 180,
  prikaziFooter = true,
  kartica = true,
}: MiniMapaProps) {
  const imaStored = lat != null && lng != null;

  const [center, setCenter] = useState<{ lat: number; lon: number }>(
    imaStored ? { lat: lat!, lon: lng! } : DEFAULT_CENTER,
  );
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(
    imaStored ? { lat: lat!, lon: lng! } : null,
  );
  const [zoom, setZoom] = useState(imaStored ? 15 : 13);
  const [geocoding, setGeocoding] = useState(!imaStored);

  useEffect(() => {
    if (!adresa.trim()) {
      setGeocoding(false);
      return;
    }
    const ctrl = new AbortController();
    setGeocoding(true);

    (async () => {
      const coords = await geocodeAdresa(adresa);
      if (!ctrl.signal.aborted && coords) {
        setPin(coords);
        setCenter(coords);
        setZoom(16);
      }
      if (!ctrl.signal.aborted) setGeocoding(false);
    })();

    return () => ctrl.abort();
  }, [adresa]);

  const mapsUrl = pin
    ? `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresa)}`;

  const wrapper = kartica
    ? {
        className: 'overflow-hidden rounded-2xl',
        style: {
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.3)',
          backgroundColor: 'rgb(255 255 255/0.95)',
        } as React.CSSProperties,
      }
    : {
        className: 'overflow-hidden rounded-2xl',
        style: {} as React.CSSProperties,
      };

  return (
    <div className={wrapper.className} style={wrapper.style}>
      {/* Map area */}
      {geocoding && !imaStored ? (
        <div
          className="flex items-center justify-center"
          style={{
            height: visina,
            backgroundColor: 'rgb(var(--first-quinary-rgb)/0.2)',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }}
            />
            <p className="text-[11px]" style={{ color: 'var(--first-nonary)' }}>
              Lociranje adrese…
            </p>
          </div>
        </div>
      ) : (
        <TileMapView
          center={center}
          pin={pin}
          zoom={zoom}
          height={visina}
          onCenter={setCenter}
          onZoom={setZoom}
        />
      )}

      {/* Footer */}
      {prikaziFooter && (
        <div
          className="flex items-center justify-between gap-3 px-3 py-2.5"
          style={{
            borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.2)',
            backgroundColor: 'rgb(255 255 255/0.97)',
          }}
        >
          <div className="flex min-w-0 items-start gap-2">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
              style={{ color: 'var(--first-primary)' }}
            />
            <p
              className="truncate text-xs font-medium leading-snug"
              style={{ color: 'var(--first-octonary)' }}
            >
              {adresa || '-'}
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--first-secondary)', color: '#fff' }}
          >
            <Navigation className="h-3 w-3" />
            Maps
          </a>
        </div>
      )}
    </div>
  );
}
