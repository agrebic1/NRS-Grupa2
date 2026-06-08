// ─── Centralizovane boje i oznake statusnih / prioritetnih vrijednosti ────────
//
// Koristiti umjesto lokalnih duplikata u stranicama servisera i dispečera.

/** Mapira operativni prioritet u hex boju. */
export function prioritetBoja(p: string | null): string {
  switch ((p ?? '').toUpperCase()) {
    case 'HITNO':
      return '#DC2626';
    case 'KRITIČNO':
      return '#991B1B';
    case 'VISOKO':
      return '#EA580C';
    case 'SREDNJE':
      return '#D97706';
    default:
      return 'var(--first-secondary)';
  }
}

/** Mapira status intervencije u CSS boju (CSS varijabla ili hex). */
export function statusBoja(s: string): string {
  switch (s) {
    case 'pending_review':
    case 'na_cekanju':
      return 'var(--first-nonary)';
    case 'in_review':
      return '#7E22CE';
    case 'potvrdeno':
      return '#0369A1';
    case 'dodijeljeno':
      return 'var(--first-senary)';
    case 'u_radu':
    case 'u_izvrsenju':
      return 'var(--first-secondary)';
    case 'zavrseno':
      return '#166534';
    case 'zatvoreno':
      return 'var(--first-nonary)';
    case 'otkazano':
      return '#DC2626';
    case 'odbijeno':
      return '#991B1B';
    default:
      return 'var(--first-nonary)';
  }
}

/**
 * Korisničke dashboard badge boje po `KorisnickiDashboardStatus` (bez 'novi' - dinamično).
 * Jedinstven izvor istine; importovati u `korisnickiTokPrikaz.ts` i `KorisnikPregledDashboard.tsx`.
 */
export const KORISNIK_PALETA_DASHBOARD_STATUS: Record<
  | 'u_obradi'
  | 'potvrdeno'
  | 'u_toku'
  | 'zavrseno'
  | 'zatvoreno'
  | 'otkazano'
  | 'odbijeno',
  { pozadina: string; boja: string }
> = {
  u_obradi: { pozadina: 'rgba(202,138,4,0.12)', boja: '#A16207' },
  potvrdeno: { pozadina: 'rgba(3,105,161,0.10)', boja: '#0369A1' },
  u_toku: {
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.14)',
    boja: 'var(--first-secondary)',
  },
  zavrseno: { pozadina: 'rgba(22,101,52,0.10)', boja: '#166534' },
  zatvoreno: {
    pozadina: 'rgb(var(--first-quinary-rgb) / 0.3)',
    boja: 'var(--first-nonary)',
  },
  otkazano: {
    pozadina: 'rgb(var(--first-quinary-rgb) / 0.3)',
    boja: 'var(--first-nonary)',
  },
  odbijeno: {
    pozadina: 'rgb(var(--first-senary-rgb) / 0.2)',
    boja: 'var(--first-senary)',
  },
};

/** Mapira status intervencije u čitljivi naziv na bosanskom. */
export function statusOznaka(s: string): string {
  switch (s) {
    case 'pending_review':
    case 'na_cekanju':
      return 'Novi zahtjev';
    case 'in_review':
      return 'U obradi';
    case 'potvrdeno':
      return 'Čeka dodjelu';
    case 'dodijeljeno':
      return 'Dodijeljeno';
    case 'u_radu':
      return 'Na putu';
    case 'u_izvrsenju':
      return 'Na terenu';
    case 'zavrseno':
      return 'Završeno';
    case 'zatvoreno':
      return 'Zatvoreno';
    case 'otkazano':
      return 'Otkazano';
    case 'odbijeno':
      return 'Odbijeno';
    default:
      return s;
  }
}
