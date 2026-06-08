/**
 * Geo-izračun za US-51 — procjena udaljenosti i trajanja puta između bazne
 * lokacije servisera i mjesta intervencije.
 *
 * Koristi Haversine formulu za pravocrtnu udaljenost, korigiranu faktorom
 * koji uzima u obzir cestovnu mrežu i prosječne uvjete vožnje u BiH.
 */

// ─── Haversine formula ────────────────────────────────────────────────────────

const R_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Procjena cestovne udaljenosti i trajanja ─────────────────────────────────

/**
 * Faktor korekcije pravocrtne udaljenosti za cestovnu mrežu u BiH.
 * Tipično 1.25–1.45 za kombinovanu gradsku i prigradsku vožnju.
 */
const CESTOVNI_FAKTOR = 1.35;

/**
 * Prosječna brzina vožnje u km/h za urbano + prigradsko okruženje u BiH.
 * Konzervativna procjena uzima u obzir semafore i gušće saobraćajne tokove.
 */
const PROSJECNA_BRZINA_KMH = 45;

export interface RutaInfo {
  /** Pravocrtna (Haversine) udaljenost u km. */
  pravacKm: number;
  /** Procijenjena cestovna udaljenost u km (pravac × faktor). */
  procjenaKm: number;
  /** Procijenjeno trajanje puta u minutama. */
  minuteProcjena: number;
}

/**
 * Izračunava procijenjenu rutu između dvije geografske tačke.
 * Vraća pravocrtnu udaljenost, procijenjenu cestovnu udaljenost i
 * procijenjeno trajanje puta.
 */
export function izracunajRutu(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): RutaInfo {
  const pravacKm = haversineKm(lat1, lng1, lat2, lng2);
  const procjenaKm = pravacKm * CESTOVNI_FAKTOR;
  const minuteProcjena = (procjenaKm / PROSJECNA_BRZINA_KMH) * 60;
  return { pravacKm, procjenaKm, minuteProcjena };
}

// ─── Formatiranje ─────────────────────────────────────────────────────────────

/** Formatira udaljenost u km s prikladnom preciznošću. */
export function formatirajUdaljenost(km: number): string {
  if (km < 0.1) return '< 100 m';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Formatira trajanje puta u minute ili sate + minute. */
export function formatirajTrajanjePuta(mins: number): string {
  if (mins < 1) return '< 1 min';
  const m = Math.round(mins);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}
