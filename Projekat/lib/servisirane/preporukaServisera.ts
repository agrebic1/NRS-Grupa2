import type { ServiserZaDodjelu } from '@/domain/types/servisirane';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreporukaServisera {
  serviser:      ServiserZaDodjelu;
  score:         number;          // 0-100 (weighted composite)
  razlozi:       string[];        // human-readable reasons shown in UI
  jePreporucen:  boolean;         // true only for the top-ranked entry
  /** US-48: udaljenost (km) od lokacije kvara. null kad koordinate nedostaju. */
  udaljenost_km: number | null;
}

// ─── Scoring weights ──────────────────────────────────────────────────────────
//
// Stručnost (specialisation match):  40 %
// Opterećenje (active-task inverse):  35 %
// Verifikacija:                       25 %
// Blizina (US-48):                    20 %  ← uračunava se SAMO kad i zahtjev i
//                                            serviser imaju koordinate
//
// Težine se po serviseru DINAMIČKI normalizuju (dijele zbirom primjenjivih
// težina). Kad blizina nije primjenjiva, prve tri normalizuju na 0.40/0.35/0.25
// — identično ponašanju prije US-48 (graceful fallback, postojeći scoring se ne mijenja).

const W_STRUCNOST    = 0.40;
const W_OPTERECENJE  = 0.35;
const W_VERIFIKACIJA = 0.25;
const W_BLIZINA      = 0.20;

/** Udaljenost (km) na kojoj bodovi blizine padaju na 0. */
const MAX_BLIZINA_KM = 50;
/** Udaljenost (km) do koje serviser dobija pun bonus blizine. */
const FULL_BLIZINA_KM = 5;

function opterecenjeScore(aktivnih: number): number {
  if (aktivnih === 0) return 100;
  if (aktivnih === 1) return 67;
  if (aktivnih === 2) return 33;
  return 0;
}

function jeBroj(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Haversine udaljenost u kilometrima između dvije geografske tačke. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Zemljin radijus (km)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bodovi blizine 0-100: ≤5 km = 100, linearno do 0 na MAX_BLIZINA_KM. */
function blizinaScore(km: number): number {
  if (km <= FULL_BLIZINA_KM) return 100;
  if (km >= MAX_BLIZINA_KM) return 0;
  return Math.round(100 * (1 - (km - FULL_BLIZINA_KM) / (MAX_BLIZINA_KM - FULL_BLIZINA_KM)));
}

// ─── Core ranking function ────────────────────────────────────────────────────

export function izracunajPreporuke(
  serviseri: ServiserZaDodjelu[],
  options: {
    kategorija?: string | null;
    izuzeti?:    string[];          // serviser IDs to exclude from ranking
    zahtjevLat?: number | null;     // US-48: lokacija kvara
    zahtjevLng?: number | null;
  } = {}
): PreporukaServisera[] {
  const { kategorija, izuzeti = [], zahtjevLat, zahtjevLng } = options;
  const zahtjevImaKoord = jeBroj(zahtjevLat) && jeBroj(zahtjevLng);
  const dostupni = serviseri.filter(s => !izuzeti.includes(s.id));

  const rangirani = dostupni.map(s => {
    const razlozi: string[] = [];

    // ── Stručnost ────────────────────────────────────────────────────────────
    let strucnostScore = 0;
    if (s.specialnosti.length > 0 && kategorija) {
      const kat = kategorija.toLowerCase();
      const matchIdx = s.specialnosti.findIndex(sp =>
        sp.toLowerCase().includes(kat) || kat.includes(sp.toLowerCase().split(' ')[0] ?? '')
      );
      if (matchIdx >= 0) {
        strucnostScore = 100;
        razlozi.push(`Specijalista: ${s.specialnosti[matchIdx]}`);
      } else {
        strucnostScore = 20;
      }
    } else if (s.specialnosti.length > 0) {
      strucnostScore = 50;
      razlozi.push('Opće iskustvo');
    }

    // ── Opterećenje ──────────────────────────────────────────────────────────
    const opScore = opterecenjeScore(s.aktivnih_zadataka);
    if (s.aktivnih_zadataka === 0) {
      razlozi.push('Slobodan');
    } else {
      razlozi.push(`${s.aktivnih_zadataka} aktiv. ${s.aktivnih_zadataka === 1 ? 'zadatak' : 'zadatka'}`);
    }

    // ── Verifikacija ─────────────────────────────────────────────────────────
    const verScore = s.is_verified ? 100 : 0;
    if (s.is_verified) razlozi.push('Verificiran');

    // ── Blizina (US-48) — samo kad obje strane imaju koordinate ───────────────
    let udaljenost_km: number | null = null;
    let blizScore = 0;
    let blizinaPrimjenjiva = false;
    if (zahtjevImaKoord && jeBroj(s.latitude) && jeBroj(s.longitude)) {
      udaljenost_km = Math.round(haversineKm(zahtjevLat!, zahtjevLng!, s.latitude, s.longitude) * 10) / 10;
      blizScore = blizinaScore(udaljenost_km);
      blizinaPrimjenjiva = true;
    }

    // ── Ponderisani zbir s dinamičkom normalizacijom ──────────────────────────
    let suma   = strucnostScore * W_STRUCNOST + opScore * W_OPTERECENJE + verScore * W_VERIFIKACIJA;
    let tezine = W_STRUCNOST + W_OPTERECENJE + W_VERIFIKACIJA;
    if (blizinaPrimjenjiva) {
      suma   += blizScore * W_BLIZINA;
      tezine += W_BLIZINA;
    }
    const score = Math.round(suma / tezine);

    return { serviser: s, score, razlozi, udaljenost_km };
  });

  rangirani.sort((a, b) => b.score - a.score);

  // Pronađi najbližeg servisera (najmanja udaljenost) za poseban razlog.
  let najbliziId: string | null = null;
  let minKm = Infinity;
  for (const r of rangirani) {
    if (r.udaljenost_km != null && r.udaljenost_km < minKm) {
      minKm = r.udaljenost_km;
      najbliziId = r.serviser.id;
    }
  }

  return rangirani.map((r, i) => {
    const razlozi = [...r.razlozi];
    if (r.udaljenost_km != null) {
      if (r.serviser.id === najbliziId) {
        razlozi.unshift(`Najbliži (${r.udaljenost_km} km)`);
      } else {
        razlozi.push(`${r.udaljenost_km} km`);
      }
    }
    return { ...r, razlozi, jePreporucen: i === 0 && r.score > 0 };
  });
}

// ─── Score colour helper (reusable by UI) ────────────────────────────────────

export function scoreBojaHex(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 40) return '#D97706';
  return '#DC2626';
}
