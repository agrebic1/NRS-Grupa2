'use client';

/**
 * RutaMapa — interaktivna OSM tile-mapa s dva markera (bazna lokacija servisera
 * i lokacija intervencije) i iscrtanom linijom rute između njih.
 *
 * Koristi isti custom tile-rendering pristup kao MiniMapa i MapaOdabir,
 * bez eksternih biblioteka (Leaflet, Mapbox, Google Maps Embed).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Home, MapPin } from 'lucide-react';

// ─── Tile matematika ──────────────────────────────────────────────────────────

const TILE_SIZE = 256;

function latLonToTileFloat(lat: number, lon: number, z: number) {
  const n      = Math.pow(2, z);
  const x      = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y      = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

/**
 * Izračunava optimalni zoom nivo da oba markera budu vidljiva unutar granica mape
 * s 30% padding-a na svakoj strani.
 */
function calculateFitZoom(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  mapW: number, mapH: number,
): number {
  if (Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lng1 - lng2) < 0.0001) return 16;
  for (let z = 17; z >= 4; z--) {
    const p1  = latLonToTileFloat(lat1, lng1, z);
    const p2  = latLonToTileFloat(lat2, lng2, z);
    const pxW = Math.abs(p1.x - p2.x) * TILE_SIZE;
    const pxH = Math.abs(p1.y - p2.y) * TILE_SIZE;
    if (pxW <= mapW * 0.6 && pxH <= mapH * 0.6) return Math.max(z - 1, 4);
  }
  return 4;
}

// ─── Interfejs ────────────────────────────────────────────────────────────────

export interface RutaMapaProps {
  /** Koordinate bazne lokacije servisera. */
  baznaLat: number;
  baznaLng: number;
  /** Koordinate lokacije intervencije. */
  destLat:  number;
  destLng:  number;
  /** Visina tile-mape u pikselima. @default 220 */
  visina?:  number;
}

// ─── Komponenta ───────────────────────────────────────────────────────────────

export function RutaMapa({ baznaLat, baznaLng, destLat, destLng, visina = 220 }: RutaMapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef      = useRef<{
    startX: number; startY: number;
    startLat: number; startLon: number;
    moved: boolean;
  } | null>(null);

  const midLat = (baznaLat + destLat) / 2;
  const midLon = (baznaLng + destLng) / 2;

  const [w,      setW]      = useState(350);
  const [center, setCenter] = useState({ lat: midLat, lon: midLon });
  const [zoom,   setZoom]   = useState(12);

  // Recalculate fit whenever props or container width change
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const newW = containerRef.current.offsetWidth;
      setW(newW);
      setZoom(calculateFitZoom(baznaLat, baznaLng, destLat, destLng, newW, visina));
      setCenter({ lat: midLat, lon: midLon });
    });
    obs.observe(containerRef.current);
    const initW = containerRef.current.offsetWidth;
    setW(initW);
    setZoom(calculateFitZoom(baznaLat, baznaLng, destLat, destLng, initW, visina));
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baznaLat, baznaLng, destLat, destLng, visina, midLat, midLon]);

  const midX       = w / 2;
  const midY       = visina / 2;
  const centerTile = latLonToTileFloat(center.lat, center.lon, zoom);
  const n          = Math.pow(2, zoom);
  const countX     = Math.ceil(w / TILE_SIZE) + 2;
  const countY     = Math.ceil(visina / TILE_SIZE) + 2;
  const baseX      = Math.floor(centerTile.x) - Math.floor(countX / 2);
  const baseY      = Math.floor(centerTile.y) - Math.floor(countY / 2);

  const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let dx = 0; dx <= countX; dx++) {
    for (let dy = 0; dy <= countY; dy++) {
      const tx = baseX + dx;
      const ty = baseY + dy;
      tiles.push({
        tx, ty,
        left: (tx - centerTile.x) * TILE_SIZE + midX,
        top:  (ty - centerTile.y) * TILE_SIZE + midY,
      });
    }
  }

  // Pixel positions za markere
  const bTile = latLonToTileFloat(baznaLat, baznaLng, zoom);
  const bLeft = Math.round((bTile.x - centerTile.x) * TILE_SIZE + midX);
  const bTop  = Math.round((bTile.y - centerTile.y) * TILE_SIZE + midY);

  const dTile = latLonToTileFloat(destLat, destLng, zoom);
  const dLeft = Math.round((dTile.x - centerTile.x) * TILE_SIZE + midX);
  const dTop  = Math.round((dTile.y - centerTile.y) * TILE_SIZE + midY);

  // ─── Drag handleri ────────────────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent) {
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startLat: center.lat, startLon: center.lon,
      moved: false,
    };
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    const st = latLonToTileFloat(dragRef.current.startLat, dragRef.current.startLon, zoom);
    const tx = st.x - dx / TILE_SIZE;
    const ty = st.y - dy / TILE_SIZE;
    setCenter({
      lon: (tx / n) * 360 - 180,
      lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n))) * 180) / Math.PI,
    });
  }, [zoom, n]);

  function handleMouseUp() { dragRef.current = null; }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: visina, cursor: 'grab', userSelect: 'none', backgroundColor: '#e8e0d8' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={e => {
        e.preventDefault();
        setZoom(prev => e.deltaY < 0 ? Math.min(prev + 1, 18) : Math.max(prev - 1, 3));
      }}
      role="img"
      aria-label="Mapa rute od bazne lokacije do intervencije"
    >
      {/* Tile slike */}
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
              left:     Math.round(left),
              top:      Math.round(top),
              width:    TILE_SIZE,
              height:   TILE_SIZE,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* SVG: linija rute između bazne lokacije i intervencije */}
      <svg
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
        }}
        aria-hidden
      >
        {/* Sjenka linije za čitljivost na satelitskim kartama */}
        <line
          x1={bLeft} y1={bTop} x2={dLeft} y2={dTop}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Plava isprekidana ruta */}
        <line
          x1={bLeft} y1={bTop} x2={dLeft} y2={dTop}
          stroke="var(--first-secondary)"
          strokeWidth={3}
          strokeDasharray="10 6"
          strokeLinecap="round"
          opacity={0.9}
        />
      </svg>

      {/* Marker: Bazna lokacija servisera (narandžasti krug s Home ikonom) */}
      <div
        style={{
          position: 'absolute',
          left:     bLeft - 14,
          top:      bTop  - 14,
          pointerEvents: 'none',
        }}
        title="Vaša bazna lokacija"
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: '#D97706',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Home style={{ width: 13, height: 13, color: 'white' }} />
        </div>
      </div>

      {/* Marker: Lokacija intervencije (plavi MapPin) */}
      <div
        style={{
          position: 'absolute',
          left:     dLeft - 14,
          top:      dTop  - 32,
          pointerEvents: 'none',
          filter:   'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
        }}
        title="Lokacija intervencije"
      >
        <MapPin style={{ width: 32, height: 32, color: 'var(--first-primary)' }} />
      </div>

      {/* Zoom kontrole */}
      <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: '+', action: () => setZoom(z => Math.min(z + 1, 18)), aria: 'Približi mapu' },
          { label: '−', action: () => setZoom(z => Math.max(z - 1, 3)),  aria: 'Udalji mapu' },
        ].map(({ label, action, aria }) => (
          <button
            key={label}
            type="button"
            onClick={e => { e.stopPropagation(); action(); }}
            aria-label={aria}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold shadow transition-colors hover:bg-gray-50"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#1f2a30' }}
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
