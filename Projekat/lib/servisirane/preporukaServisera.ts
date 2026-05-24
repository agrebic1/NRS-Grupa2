import type { ServiserZaDodjelu } from '@/domain/types/servisirane';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreporukaServisera {
  serviser:     ServiserZaDodjelu;
  score:        number;      // 0-100 (weighted composite)
  razlozi:      string[];    // human-readable reasons shown in UI
  jePreporucen: boolean;     // true only for the top-ranked entry
}

// ─── Scoring weights ──────────────────────────────────────────────────────────
//
// Stručnost (specialisation match):  40 %
// Opterećenje (active-task inverse):  35 %
// Verifikacija:                       25 %
//
// Proximity & experience are omitted - no location/rating data in current model.

const W_STRUCNOST    = 0.40;
const W_OPTERECENJE  = 0.35;
const W_VERIFIKACIJA = 0.25;

function opterecenjeScore(aktivnih: number): number {
  if (aktivnih === 0) return 100;
  if (aktivnih === 1) return 67;
  if (aktivnih === 2) return 33;
  return 0;
}

// ─── Core ranking function ────────────────────────────────────────────────────

export function izracunajPreporuke(
  serviseri: ServiserZaDodjelu[],
  options: {
    kategorija?: string | null;
    izuzeti?:    string[];          // serviser IDs to exclude from ranking
  } = {}
): PreporukaServisera[] {
  const { kategorija, izuzeti = [] } = options;
  const dostupni = serviseri.filter(s => !izuzeti.includes(s.id));

  const rangirani = dostupni.map(s => {
    let score = 0;
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
    score += strucnostScore * W_STRUCNOST;

    // ── Opterećenje ──────────────────────────────────────────────────────────
    const opScore = opterecenjeScore(s.aktivnih_zadataka);
    score += opScore * W_OPTERECENJE;
    if (s.aktivnih_zadataka === 0) {
      razlozi.push('Slobodan');
    } else {
      razlozi.push(`${s.aktivnih_zadataka} aktiv. ${s.aktivnih_zadataka === 1 ? 'zadatak' : 'zadatka'}`);
    }

    // ── Verifikacija ─────────────────────────────────────────────────────────
    if (s.is_verified) {
      score += 100 * W_VERIFIKACIJA;
      razlozi.push('Verificiran');
    }

    return { serviser: s, score: Math.round(score), razlozi };
  });

  rangirani.sort((a, b) => b.score - a.score);

  return rangirani.map((r, i) => ({ ...r, jePreporucen: i === 0 && r.score > 0 }));
}

// ─── Score colour helper (reusable by UI) ────────────────────────────────────

export function scoreBojaHex(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 40) return '#D97706';
  return '#DC2626';
}
